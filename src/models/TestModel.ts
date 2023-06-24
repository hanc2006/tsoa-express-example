import {
    DependentRequired, Enum, JsonSchema, MaxLength, MinLength, Optional, Pattern, Required, Type
} from 'ts-decorator-json-schema-generator/lib/esm';


export enum Status {
    Happy = 'Happy',
    Sad = 'Sad'
}

export type StatusLiteral = 'Happy' | 'Sad';

@JsonSchema({
    id: 'https://example.com/manager.json',
    title: 'Manager Schema'
})
export class Manager {
    @Required()
    public id!: number;

    @Required()
    public name!: string;
}

@JsonSchema({
    id: 'https://example.com/user.json',
    title: 'User Schema',
})
export class User {
    @Required()
    @Pattern(/^[a-zA-Z_]+$/)
    public email!: string;

    @Required()
    @MinLength(4)
    @MaxLength(16)
    @Pattern(/^[a-zA-Z_]+$/)
    public name!: string;

    @Required()
    @Enum(Status)
    public status!: Status;

    @Optional()
    public streetAddress?: string;

    @Optional()
    @DependentRequired('streetAddress')
    public extendedAddress?: string;

    @Required()
    @Type(Manager)
    public managers!: Manager[]
}

