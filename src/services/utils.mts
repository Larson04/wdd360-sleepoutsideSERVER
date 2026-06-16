import type { QueryParams, User } from "../models/types.mts";
import jwt from "jsonwebtoken";
import EntityNotFoundError from "../errors/EntityNotFoundError.mts";
import Ajv from "ajv";
import addFormats from "ajv-formats"
import addKeywords from "ajv-keywords"
import type { JSONSchema7 } from "json-schema"

export function validator(schema:JSONSchema7 , data:Object) {
  // for some reason typescript doesn't like this even though it is exactly how the documentation says to use these. We are just going to ignore the types for now 🤷🏻‍♂️
  // @ts-ignore
  const ajv = new Ajv();
  // @ts-ignore
  addFormats(ajv);
  // @ts-ignore
  addKeywords(ajv, "instanceof"); 
  const validate = ajv.compile(schema)
  if(!validate(data)) {
      if(validate.errors) {
          // validate.errors is an array.  I've never seen more than one error come back...but just in case we can map over it and pull out the message(s)
          // We need to do this because our errorHandler is expecting a string...not an array of objects.
          const message = validate.errors.map((error:any)=> error.instancePath+" "+error.message).join(", ");
          throw new EntityNotFoundError({message:message, statusCode:400 });
      }
  }
}
 
export function formatFields(fields:string) {
    const fieldsArr = fields?.split(",");
    if(fieldsArr) {
        const filter = fieldsArr
        .map((field:string) => field.trim())
        .reduce((acc: Record<string, any>, current:string) => ({ ...acc, [current]: 1 }), {});
        // a longer form of doing this conversion
        // let filter: Record<string, any> = {};
        // if(fieldsArr) {
        //     fieldsArr.forEach((field:string) => {
        //      filter[field.trim()] = 1
        //     })      
        // };
        console.log("formatFields:",filter)
        return filter
    }
}
 
 
export function buildPaginationWrapper(totalCount:number, query:QueryParams) {
  // here we check to see if there is a limit...if yes convert it to a number, if no set it to the default of 20
    const limit= query.limit? parseInt(query.limit) : 20;
    const offset= query.offset? parseInt(query.offset) : 0;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.ceil(offset / limit)+1;
    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    let next, prev;
    // create a new URLSearchParams object from the query parameters. This will make it easy to modify the fields we need to, while passing all the others on.
    // This is a bit of a hack because we can't use the query object directly in our URLSearchParams constructor.
    const params = new URLSearchParams(query as Record<string, any>);
  if (hasPreviousPage) {
    params.set("offset", (offset - limit).toString());
    prev = `/?${params}`;
  }
  if (hasNextPage) {
    params.set("offset", (offset + limit).toString());
    next = `/?${params}`;
  }
  return {
        count: totalCount, 
        prev: prev || null, 
        next: next || null, 
        results: [] as any
  }
}
 
export function sanitize(v:Record<string, any>) {
  if (typeof v === "object") {
      for (var key in v) {
        if (/^\$/.test(key) ) {
          delete v[key];
        } else {
          sanitize(v[key]);
        }
      }
    }
    return v;
};

export function generateToken(user:User) {
  const token = process.env.JWT_SECRET || "secret";
  const expiration = process.env.JWT_EXPIRES_IN || "10m";
  const jwtUser = {email: user.email, id: user._id}
  return jwt.sign(jwtUser, token, { expiresIn: expiration });

}