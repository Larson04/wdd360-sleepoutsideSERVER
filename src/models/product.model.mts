import mongodb from "../database/index.mts";
import type {Product, FindProductObj} from "./types.mts";
import { formatFields } from "../services/utils.mts";
import type { Collection } from "mongodb";


// products. Model:
 
export async function getAllProducts(find:FindProductObj) {

    // get a reference to our Products collection

    const productsCollection:Collection<Product> = mongodb.getDb().collection<Product>('products');    

    // build a proper MongoDB filter from the search object
    const filter: any = {};
    
    if(find.search.name) {
      filter.name = { $regex: find.search.name, $options: 'i' };
    }
    if(find.search.descriptionHtmlSimple) {
      filter.descriptionHtmlSimple = { $regex: find.search.descriptionHtmlSimple, $options: 'i' };
    }
    if(find.search.category) {
      filter.category = find.search.category;
    }

      // get the total number of records matching our query

      const totalCount = await productsCollection.countDocuments(filter);

    // apply the filters to get the matching records

      const cursor = await productsCollection.find(filter).skip(find.offset).limit(find.limit);

    // if fields were specified then reduce the results to just the required fields

      if(find.fieldFilters) {

        cursor.project(find.fieldFilters);

    }

    // finally convert the result to an array that we can consume

    const results = await cursor.toArray();

    console.log(totalCount, results)

        return {results, totalCount};

}
 

async function getProductById(id: string): Promise<Product | null> {
    const data = (await mongodb.getDb().collection<Product>("products").findOne({ id: id }));
    return data;
}

async function searchProducts(query: string): Promise<Product[] | null> {
  const data = (await mongodb.getDb().collection<Product>("products").find({
    $or: [
      { category : { $regex: query, $options: "i"}},
      { name : { $regex: query, $options: "i"}},
      { description : { $regex: query, $options: "i"}},
    ]
  }
  )).toArray();

  return data;
}  


export default {
    getProductById,
    getAllProducts,
    searchProducts
};


