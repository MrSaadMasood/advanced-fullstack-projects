import { Db } from "mongodb";
import { connectData, databaseSchemaPopulator, getData } from "./connection.js";

(async () => {
    try {
        let database: Db | undefined;
        await connectData((err) => {
            if (!err) return (database = getData());
            console.log("the database population failed");
            return;
        });
        if (!database) throw new Error();
        await databaseSchemaPopulator(database);
        console.log("the databaes schema has now been defined");
    } catch (error) {
        console.log("failed to update the database with the schema");
    }
})();
