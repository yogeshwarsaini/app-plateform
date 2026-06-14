from aws_cdk import (
    Stack,
    Duration,
    CfnOutput,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_ecr as ecr,
    aws_iam as iam,
    aws_logs as logs,
)
from constructs import Construct


class EcsStack(Stack):

    def __init__(self, scope: Construct, construct_id: str,
                 config: dict, vpc, backend_repo, frontend_repo, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        env_name = config["env"]

        # ECS Cluster
        self.cluster = ecs.Cluster(self, "Cluster",
            cluster_name=f"myapp-{env_name}-cluster",
            vpc=vpc,
            container_insights=True,
        )

        # Task Execution Role — ECS ko ECR pull karne ke liye
        execution_role = iam.Role(self, "ExecutionRole",
            role_name=f"myapp-{env_name}-ecs-execution-role",
            assumed_by=iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "service-role/AmazonECSTaskExecutionRolePolicy"
                ),
            ],
        )

        # CloudWatch Log Groups
        backend_logs = logs.LogGroup(self, "BackendLogs",
            log_group_name=f"/myapp/{env_name}/backend",
            retention=logs.RetentionDays.ONE_WEEK,
        )
        frontend_logs = logs.LogGroup(self, "FrontendLogs",
            log_group_name=f"/myapp/{env_name}/frontend",
            retention=logs.RetentionDays.ONE_WEEK,
        )

        # ── BACKEND ──────────────────────────────────────────

        backend_task = ecs.FargateTaskDefinition(self, "BackendTask",
            family=f"myapp-{env_name}-backend",
            cpu=256,
            memory_limit_mib=512,
            execution_role=execution_role,
        )

        backend_task.add_container("BackendContainer",
            image=ecs.ContainerImage.from_ecr_repository(
                backend_repo, tag="latest"
            ),
            port_mappings=[ecs.PortMapping(container_port=8000)],
            environment={"APP_ENV": env_name},
            logging=ecs.LogDrivers.aws_logs(
                stream_prefix="backend",
                log_group=backend_logs,
            ),
            health_check=ecs.HealthCheck(
                command=["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health')\""],
                interval=Duration.seconds(30),
                timeout=Duration.seconds(10),
                retries=3,
            ),
        )

        # Backend Service with ALB
        self.backend_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "BackendService",
            service_name=f"myapp-{env_name}-backend-service",
            cluster=self.cluster,
            task_definition=backend_task,
            desired_count=config.get("backend_desired_count", 1),
            public_load_balancer=True,
            listener_port=80,
            assign_public_ip=False,
        )

        self.backend_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200",
            interval=Duration.seconds(30),
        )

        # ── FRONTEND ─────────────────────────────────────────

        frontend_task = ecs.FargateTaskDefinition(self, "FrontendTask",
            family=f"myapp-{env_name}-frontend",
            cpu=256,
            memory_limit_mib=512,
            execution_role=execution_role,
        )

        frontend_task.add_container("FrontendContainer",
            image=ecs.ContainerImage.from_ecr_repository(
                frontend_repo, tag="latest"
            ),
            port_mappings=[ecs.PortMapping(container_port=80)],
            environment={"APP_ENV": env_name},
            logging=ecs.LogDrivers.aws_logs(
                stream_prefix="frontend",
                log_group=frontend_logs,
            ),
            health_check=ecs.HealthCheck(
                command=["CMD-SHELL", "wget -qO- http://localhost/health || exit 1"],
                interval=Duration.seconds(30),
                timeout=Duration.seconds(5),
                retries=3,
            ),
        )

        # Frontend Service with ALB
        self.frontend_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "FrontendService",
            service_name=f"myapp-{env_name}-frontend-service",
            cluster=self.cluster,
            task_definition=frontend_task,
            desired_count=config.get("frontend_desired_count", 1),
            public_load_balancer=True,
            listener_port=80,
            assign_public_ip=False,
        )

        self.frontend_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200",
            interval=Duration.seconds(30),
        )

        # Outputs — GitHub Actions mein use honge
        CfnOutput(self, "BackendURL",
            value=f"http://{self.backend_service.load_balancer.load_balancer_dns_name}",
            description=f"Backend ALB URL ({env_name})",
        )
        CfnOutput(self, "FrontendURL",
            value=f"http://{self.frontend_service.load_balancer.load_balancer_dns_name}",
            description=f"Frontend ALB URL ({env_name})",
        )
        CfnOutput(self, "ClusterName",
            value=self.cluster.cluster_name,
            description="ECS Cluster name",
        )
