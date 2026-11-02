export namespace SafeActionUtil {
  export function getData<T>(actionResult: any | undefined) {
    if (!actionResult?.data === undefined)
      throw new Error("Action result data is undefined");
    
    return actionResult?.data as T;
  }

  export function validateErrors(
    actionResult: any | undefined,
    serverErrorMessage: string | undefined = "การดำเนินการล้มเหลว",
    allowShowingServerErrorMessage: boolean = false
  ) {
    if (actionResult?.validationErrors) {
      const errorKeys = Object.keys(actionResult.validationErrors);

      const firstErrorKey = errorKeys[0];

      const firstErrorMessage =
        actionResult.validationErrors[firstErrorKey]._errors[0];

      throw new Error(`${firstErrorMessage}`);
    }
 
    if (actionResult?.serverError)
      throw new Error(
        allowShowingServerErrorMessage
          ? actionResult.serverError
          : serverErrorMessage
      );
  }
}
