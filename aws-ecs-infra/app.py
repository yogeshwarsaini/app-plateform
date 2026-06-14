#!/usr/bin/env python3
import json
import os
import aws_cdk as cdk

from infra.stacks.vpc_stack import VpcStack
from infra.stacks.ecr_stack import EcrStack
from infra.stacks.ecs_stack import EcsStack

app = cdk.App()

env_name = app.node.try_get_context("env") or "dev"

config_path = os.path.join(os.path.dirname(__file__), "config", f"{env_name}.json")
with open(config_path) as f:
    config = json.load(f)

aws_env = cdk.Environment(
    account=config["account_id"],
    region=config["region"],
)

prefix = f"MyApp-{env_name.capitalize()}"

# 1. VPC
vpc_stack = VpcStack(app, f"{prefix}-Vpc",
    config=config,
    env=aws_env,
)

# 2. ECR (Docker image registries)
ecr_stack = EcrStack(app, f"{prefix}-Ecr",
    config=config,
    env=aws_env,
)

# 3. ECS (Cluster + Services + ALB)
ecs_stack = EcsStack(app, f"{prefix}-Ecs",
    config=config,
    vpc=vpc_stack.vpc,
    backend_repo=ecr_stack.backend_repo,
    frontend_repo=ecr_stack.frontend_repo,
    env=aws_env,
)
ecs_stack.add_dependency(vpc_stack)
ecs_stack.add_dependency(ecr_stack)

app.synth()
