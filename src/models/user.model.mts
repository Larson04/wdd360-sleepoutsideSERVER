import mongodb from "../database/index.mts";
import type { User } from "./types.mts";
import type { Collection } from "mongodb";

async function getUserByEmail(email: string): Promise<User | null> {
    
    // get a reference to our Users collection    
    const data = (await mongodb.getDb().collection<User>("users").findOne({ email: email }));
    return data;

}

// {
//     name: "Alex",
//     email: "testuser@email.com",
//     password: hashedPassword,
//     createdAt: Date.now(),
//     updatedAt: Date.now()
//     });

async function createUser(newUser:{email:string, password:string, name:string}) {
    const result = await mongodb.getDb().collection("users").insertOne(newUser)
    return result
}

export default {
    getUserByEmail,
    createUser
}

