import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { } from '@tsoa/cli';
import { Tsoa, TsoaRoute, assertNever } from '@tsoa/runtime';
import { fsReadFile, fsWriteFile, fsMkDir } from '@tsoa/cli/dist/utils/fs';
import { ExtendedRoutesConfig, AbstractRouteGenerator } from '@tsoa/cli';
import path from 'node:path';

export interface ServerlessRoutesConfig extends ExtendedRoutesConfig {
    modelsTemplate?: string;
    modelsFileName?: string;
    handlerTemplate?: string;
    stackTemplate: string;
}

export default class ServerlessRouteGenerator extends AbstractRouteGenerator<ServerlessRoutesConfig> {
    constructor(metadata: Tsoa.Metadata, options: ServerlessRoutesConfig) {
        super(metadata, options);
        this.registerTemplateHelpers();
    }

    protected pathTransformer(path: string): string {
        return path;
    }

    registerTemplateHelpers() {
        handlebars.registerHelper('json', (context: any) => {
            return JSON.stringify(context);
        });

        const additionalPropsHelper = (additionalProperties: TsoaRoute.RefObjectModelSchema['additionalProperties']) => {
            if (additionalProperties) {
                // Then the model for this type explicitly allows additional properties and thus we should assign that
                return JSON.stringify(additionalProperties);
            } else if (this.options.noImplicitAdditionalProperties === 'silently-remove-extras') {
                return JSON.stringify(false);
            } else if (this.options.noImplicitAdditionalProperties === 'throw-on-extras') {
                return JSON.stringify(false);
            } else if (this.options.noImplicitAdditionalProperties === 'ignore') {
                return JSON.stringify(true);
            } else {
                return assertNever(this.options.noImplicitAdditionalProperties);
            }
        };
        handlebars.registerHelper('additionalPropsHelper', additionalPropsHelper);
    }

    public async GenerateCustomRoutes() {
        if (!fs.lstatSync(this.options.routesDir).isDirectory()) {
            throw new Error(`routesDir should be a directory`);
        }
        await this.generateModels();
        await this.generateRoutes();
        await this.generateStack();
    }

    async generateFileFromTemplate(templateName: string, templateContext: object, outputFileName: string) {
        const data = await fsReadFile(path.join(templateName));
        const file = data.toString();

        const template = handlebars.compile(file, { noEscape: true });

        const content = template(templateContext);

        if (await this.shouldWriteFile(outputFileName, content)) {
            return await fsWriteFile(outputFileName, content);
        }
        return Promise.resolve();
    }

    /**
     * Generate the CDK infrastructure stack that ties API Gateway to generated Handlers
     * @returns 
     */
    async generateStack(): Promise<void> {
        // This would need to generate a CDK "Stack" that takes the tsoa metadata as input and generates a valid serverless CDK infrastructure stack from template
        const templateFileName = this.options.stackTemplate;
        const fileName = `${this.options.routesDir}/stack.ts`;
        const context = this.buildContext();
        context.controllers = context.controllers.map((controller) => {
            controller.actions = controller.actions.map((action) => {
                return {
                    ...action,
                    handlerFolderName: `${this.options.routesDir}/${controller.name}`
                }
            });
            return controller;
        });
        await this.generateFileFromTemplate(templateFileName, context, fileName);
    }

    async generateModels(): Promise<void> {
        const templateFileName = this.options.modelsTemplate || 'models.hbs';
        const fileName = `${this.options.routesDir}/${this.options.modelsFileName || 'models.ts'}`;
        const context = {
            models: this.buildModels(),
            minimalSwaggerConfig: { noImplicitAdditionalProperties: this.options.noImplicitAdditionalProperties },
        };
        await this.generateFileFromTemplate(templateFileName, context, fileName);
    }

    public override buildModels(): TsoaRoute.Models {
        const models = {} as TsoaRoute.Models;
    
        Object.keys(this.metadata.referenceTypeMap).forEach(name => {
          const referenceType = this.metadata.referenceTypeMap[name];
    
          let model: TsoaRoute.ModelSchema;
          if (referenceType.dataType === 'refEnum') {
            const refEnumModel: TsoaRoute.RefEnumModelSchema = {
              dataType: 'refEnum',
              enums: referenceType.enums,
            };
            model = refEnumModel;
          } else if (referenceType.dataType === 'refObject') {
            const propertySchemaDictionary: TsoaRoute.RefObjectModelSchema['properties'] = {};
            referenceType.properties.forEach(property => {
              propertySchemaDictionary[property.name] = this.buildPropertySchema(property);
            });
    
            const refObjModel: TsoaRoute.RefObjectModelSchema = {
              dataType: 'refObject',
              properties: propertySchemaDictionary,
            };
            if (referenceType.additionalProperties) {
              refObjModel.additionalProperties = this.buildProperty(referenceType.additionalProperties);
            } else if (this.options.noImplicitAdditionalProperties !== 'ignore') {
              refObjModel.additionalProperties = false;
            } else {
              // Since Swagger allows "excess properties" (to use a TypeScript term) by default
              refObjModel.additionalProperties = true;
            }
            model = refObjModel;
          } else if (referenceType.dataType === 'refAlias') {
            const refType: TsoaRoute.RefTypeAliasModelSchema = {
              dataType: 'refAlias',
              type: {
                ...this.buildProperty(referenceType.type),
                validators: referenceType.validators,
                default: referenceType.default,
              },
            };
            model = refType;
          } else {
            model = assertNever(referenceType);
          }
    
          models[name] = model;
        });
        return models;
      }

    public async generateRoutes() {
        const context = this.buildContext();
        await Promise.all(
            context.controllers.map(async controller => {
                const templateFileName = this.options.handlerTemplate || 'handler.hbs';
                await fsMkDir(`${this.options.routesDir}/${controller.name}`, { recursive: true });
                return Promise.all(
                    controller.actions.map(action => {
                        const fileName = `${this.options.routesDir}/${controller.name}/${action.name}${this.options.esm ? '.js' : '.ts'}`;
                        return this.generateFileFromTemplate(
                            templateFileName,
                            {
                                ...context,
                                modelsFileName: this.getRelativeImportPath(`${this.options.routesDir}/${this.options.modelsFileName || 'models.ts'}`),
                                controller,
                                action,
                            },
                            fileName,
                        );
                    }),
                );
            }),
        );
    }
}