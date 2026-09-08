export type Player = {
    id: string;
    name: string;
    gender: Gender;
    drink: Drink;
    /** Undefined when this player was added from a mode that doesn't ask for it. */
    single?: boolean;
};

export enum Gender {
    None = 'none',
    Female = 'female',
    Male = 'male',
}

export enum Drink {
    Beer = 'beer',
    Wine = 'wine',
    Strong = 'strong_drink',
    None = 'none'
}