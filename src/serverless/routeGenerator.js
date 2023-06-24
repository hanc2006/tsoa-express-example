"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const handlebars = __importStar(require("handlebars"));
const runtime_1 = require("@tsoa/runtime");
const fs_1 = require("@tsoa/cli/dist/utils/fs");
const cli_1 = require("@tsoa/cli");
const node_path_1 = __importDefault(require("node:path"));
class ServerlessRouteGenerator extends cli_1.AbstractRouteGenerator {
    constructor(metadata, options) {
        super(metadata, options);
        this.registerTemplateHelpers();
    }
    pathTransformer(path) {
        return path;
    }
    registerTemplateHelpers() {
        handlebars.registerHelper('json', (context) => {
            return JSON.stringify(context);
        });
        const additionalPropsHelper = (additionalProperties) => {
            if (additionalProperties) {
                // Then the model for this type explicitly allows additional properties and thus we should assign that
                return JSON.stringify(additionalProperties);
            }
            else if (this.options.noImplicitAdditionalProperties === 'silently-remove-extras') {
                return JSON.stringify(false);
            }
            else if (this.options.noImplicitAdditionalProperties === 'throw-on-extras') {
                return JSON.stringify(false);
            }
            else if (this.options.noImplicitAdditionalProperties === 'ignore') {
                return JSON.stringify(true);
            }
            else {
                return (0, runtime_1.assertNever)(this.options.noImplicitAdditionalProperties);
            }
        };
        handlebars.registerHelper('additionalPropsHelper', additionalPropsHelper);
    }
    async GenerateCustomRoutes() {
        if (!fs.lstatSync(this.options.routesDir).isDirectory()) {
            throw new Error(`routesDir should be a directory`);
        }
        await this.generateModels();
        await this.generateRoutes();
        await this.generateStack();
    }
    async generateFileFromTemplate(templateName, templateContext, outputFileName) {
        const data = await (0, fs_1.fsReadFile)(node_path_1.default.join(templateName));
        const file = data.toString();
        const template = handlebars.compile(file, { noEscape: true });
        const content = template(templateContext);
        if (await this.shouldWriteFile(outputFileName, content)) {
            return await (0, fs_1.fsWriteFile)(outputFileName, content);
        }
        return Promise.resolve();
    }
    /**
     * Generate the CDK infrastructure stack that ties API Gateway to generated Handlers
     * @returns
     */
    async generateStack() {
        // This would need to generate a CDK "Stack" that takes the tsoa metadata as input and generates a valid serverless CDK infrastructure stack from template
        const templateFileName = this.options.stackTemplate;
        const fileName = `${this.options.routesDir}/stack.ts`;
        const context = this.buildContext();
        context.controllers = context.controllers.map((controller) => {
            controller.actions = controller.actions.map((action) => {
                return {
                    ...action,
                    handlerFolderName: `${this.options.routesDir}/${controller.name}`
                };
            });
            return controller;
        });
        await this.generateFileFromTemplate(templateFileName, context, fileName);
    }
    async generateModels() {
        const templateFileName = this.options.modelsTemplate || 'models.hbs';
        const fileName = `${this.options.routesDir}/${this.options.modelsFileName || 'models.ts'}`;
        const context = {
            models: this.buildModels(),
            minimalSwaggerConfig: { noImplicitAdditionalProperties: this.options.noImplicitAdditionalProperties },
        };
        await this.generateFileFromTemplate(templateFileName, context, fileName);
    }
    async generateRoutes() {
        const context = this.buildContext();
        await Promise.all(context.controllers.map(async (controller) => {
            const templateFileName = this.options.handlerTemplate || 'handler.hbs';
            await (0, fs_1.fsMkDir)(`${this.options.routesDir}/${controller.name}`, { recursive: true });
            return Promise.all(controller.actions.map(action => {
                const fileName = `${this.options.routesDir}/${controller.name}/${action.name}${this.options.esm ? '.js' : '.ts'}`;
                return this.generateFileFromTemplate(templateFileName, {
                    ...context,
                    modelsFileName: this.getRelativeImportPath(`${this.options.routesDir}/${this.options.modelsFileName || 'models.ts'}`),
                    controller,
                    action,
                }, fileName);
            }));
        }));
    }
}
exports.default = ServerlessRouteGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVybGVzcy9yb3V0ZUdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLHVEQUF5QztBQUV6QywyQ0FBNkQ7QUFDN0QsZ0RBQTJFO0FBQzNFLG1DQUF5RTtBQUN6RSwwREFBNkI7QUFTN0IsTUFBcUIsd0JBQXlCLFNBQVEsNEJBQThDO0lBQ2hHLFlBQVksUUFBdUIsRUFBRSxPQUErQjtRQUNoRSxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFUyxlQUFlLENBQUMsSUFBWTtRQUNsQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsdUJBQXVCO1FBQ25CLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBWSxFQUFFLEVBQUU7WUFDL0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLG9CQUE0RSxFQUFFLEVBQUU7WUFDM0csSUFBSSxvQkFBb0IsRUFBRTtnQkFDdEIsc0dBQXNHO2dCQUN0RyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQzthQUMvQztpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsOEJBQThCLEtBQUssd0JBQXdCLEVBQUU7Z0JBQ2pGLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoQztpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsOEJBQThCLEtBQUssaUJBQWlCLEVBQUU7Z0JBQzFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxL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