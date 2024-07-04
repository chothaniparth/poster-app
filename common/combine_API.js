const { getAPIALLDataResponse, errorMessage } = require("./main");
const { onlyStatusTrue } = require("./search_query");

const fetchPlanAndDetailsListInApp = async (req, res)=>{
    try{
        const planDetails = await getAPIALLDataResponse(req, res, 'tbl_plan_details', 'PlanDetailsId', onlyStatusTrue);
        const planPricing = await getAPIALLDataResponse(req, res, 'tbl_plan_pricing', 'PlanPricingId');
        res.json({
            planDetails,
            planPricing
        });    
    }catch(error){
        console.log('Fetch plan in App Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchPlanAndDetailsListInApp
}