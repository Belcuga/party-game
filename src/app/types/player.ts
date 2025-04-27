export type Player = {
    id: number;
    name: string;
    gender: Gender;
    drink: Drink;
    single: boolean;
    skipCount: number;
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