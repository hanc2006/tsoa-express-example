import { ValidationService, ValidateError, TsoaRoute, FieldErrors } from '@tsoa/runtime';

const models: TsoaRoute.Models = {
    "User": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "email": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Happy"]},{"dataType":"enum","enums":["Sad"]}]},
            "phoneNumbers": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    "Pick_User.email-or-name-or-phoneNumbers_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"phoneNumbers":{"dataType":"array","array":{"dataType":"string"},"required":true}},"validators":{}},
    },
    "UserCreationParams": {
        "dataType": "refAlias",
        "type": {"ref":"Pick_User.email-or-name-or-phoneNumbers_","validators":{}},
    },
};

const validationService = new ValidationService(models);

export function getValidatedArgs(args: any, event: any): any[] {
    const fieldErrors: FieldErrors  = {};
    const eventBody = JSON.parse(event.body);
    const values = Object.keys(args).map((key) => {
        const name = args[key].name;
        switch (args[key].in) {
            case 'request':
                return event;
            case 'query':
                return validationService.ValidateParam(args[key], event.queryStringParameters[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
            case 'path':
                return validationService.ValidateParam(args[key], event.pathParameters[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
            case 'header':
                return validationService.ValidateParam(args[key], event.headers[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
            case 'body':
                return validationService.ValidateParam(args[key], eventBody, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
            case 'body-prop':
                return validationService.ValidateParam(args[key], eventBody[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"silently-remove-extras"});
            case 'formData':
                throw new Error('Multi-part form data not supported yet');
            case 'res':
                throw new Error('Unsupported parameter type "res"');
        }
    });

    if (Object.keys(fieldErrors).length > 0) {
        throw new ValidateError(fieldErrors, '');
    }
    return values;
}