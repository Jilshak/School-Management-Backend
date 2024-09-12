import { Body } from "@nestjs/common"

export const listFilter=(data:any)=>{
    try{
        let filter:{[key:string]:any} = {}
        if(data.page){
            filter.page = data.page
        }
        if(data.limit){
            filter.limit = data.limit
        }
        // if (!data.full) {
        //     const skip = (filter.page - 1) * filter.limit;
        //   }
        return filter
    }catch(err){
        throw err
    }
}