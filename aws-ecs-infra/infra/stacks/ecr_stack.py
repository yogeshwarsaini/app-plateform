from aws_cdk import (
    Stack,
    RemovalPolicy,
    aws_ecr as ecr,
)
from constructs import Construct


class EcrStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, config: dict, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        env_name = config["env"]

        # Backend ECR repo
        self.backend_repo = ecr.Repository(self, "BackendRepo",
            repository_name=f"myapp-{env_name}-backend",
            removal_policy=RemovalPolicy.DESTROY,
            empty_on_delete=True,
            lifecycle_rules=[
                ecr.LifecycleRule(
                    max_image_count=10,
                    description="Sirf last 10 images rakho",
                )
            ],
        )

        # Frontend ECR repo
        self.frontend_repo = ecr.Repository(self, "FrontendRepo",
            repository_name=f"myapp-{env_name}-frontend",
            removal_policy=RemovalPolicy.DESTROY,
            empty_on_delete=True,
            lifecycle_rules=[
                ecr.LifecycleRule(
                    max_image_count=10,
                    description="Sirf last 10 images rakho",
                )
            ],
        )
