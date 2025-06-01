class APIError extends Error{
    constructor(
        statuscode,
        message="somthing went wrong",
        error=[],
        stack
    ){
        super(this.message)
        this.statuscode=statuscode
        this.error=error
        this.message=message
        this.stack=stack
        this.success=false
        
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {APIError}