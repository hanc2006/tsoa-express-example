import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";

export class RoutesStack extends cdk.Stack {
  readonly requestValidator: apigateway.RequestValidator;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);
    // Generate an API Gateway
    const api = new apigateway.RestApi(this, "tsoa-api", {
      restApiName: "TSOA Generated Service"
    });

    this.requestValidator = api.addRequestValidator('RequestValidator', {
      validateRequestBody: true,
      validateRequestParameters: true
    });

    // Controller - UsersController
    // UsersController - getUser
    // create a lambda using the generated handler template code
    const handler_UsersController_getUser = new lambda.Function(this, "UsersController_getUser", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("./src/aws/UsersController"),
      handler: "getUser.handler",
      memorySize: 1024,
      timeout: cdk.Duration.seconds(20),
      reservedConcurrentExecutions: 60
    });

    // create an API Gateway path resource for the action using the tsoa path metadata
    const resource_UsersController_getUser = this.createApiGatewayResource("/v1/users/{userId}", api);

    // attach the lamdba to the resource
    resource_UsersController_getUser.addMethod("get", new apigateway.LambdaIntegration(handler_UsersController_getUser)); 


    // attach the lamdba to the resource
    resource_UsersController_getUser.addMethod("get", new LambdaIntegration(handler_UsersController_getUser), {
      requestValidator: this.requestValidator,
      requestModels: {
        'application/json': new Model(this, 'RequestModel_' + resource_UsersController_getUser.node.id, {
          restApi: api,
          contentType: 'application/json',
          schema: generateJsonSchema(User),
        })
      },
      requestParameters: {
        'method.request.path.userId': true,
      },
    });
   
    // UsersController - createUser
    // create a lambda using the generated handler template code
    const handler_UsersController_createUser = new lambda.Function(this, "UsersController_createUser", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("./src/aws/UsersController"),
      handler: "createUser.handler",
      memorySize: 1024,
      timeout: cdk.Duration.seconds(20),
      reservedConcurrentExecutions: 60
    });

    // create an API Gateway path resource for the action using the tsoa path metadata
    const resource_UsersController_createUser = this.createApiGatewayResource("/v1/users", api);

    // attach the lamdba to the resource
    resource_UsersController_createUser.addMethod("post", new apigateway.LambdaIntegration(handler_UsersController_createUser)); 


    // attach the lamdba to the resource
    resource_UsersController_getUser.addMethod("get", new LambdaIntegration(handler_UsersController_getUser), {
      requestValidator: this.requestValidator,
      requestModels: {
        'application/json': new Model(this, 'RequestModel_' + resource_UsersController_getUser.node.id, {
          restApi: api,
          contentType: 'application/json',
          schema: generateJsonSchema(User),
        })
      },
      requestParameters: {
        'method.request.path.userId': true,
      },
    });
   
  }

  private resources: Record<string, apigateway.IResource> = {};
  /**
   *   Resources in API Gateway are needed for each path "part"
   *   Use this method to create each resource for a given nested path
   *   Re-uses existing path parts to prevent possible duplication errors
   */
  createApiGatewayResource(fullPath: string, api: apigateway.IRestApi) {
    const pathParts = fullPath.split("/");
    return pathParts.reduce((parentResource: apigateway.IResource, resourceName: string) => {
      let resource;
      if (resourceName === "") return parentResource;
      const resourcePath = path.join(parentResource.path, resourceName);
      // find a previously declared Resource for this path if it exists to prevent dupes
      if (this.resources[resourcePath] !== undefined) {
        resource = this.resources[resourcePath];
      } else {
        // otherwise create a new resource for this path part
        resource = parentResource.addResource(resourceName);
      }
      this.resources[resourcePath] = resource;
      return resource;
    }, api.root);
  }
}