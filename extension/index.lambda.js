const utils = require('./src/utils')
const paymentHandler = require('./src/paymentHandler/payment-handler')
const auth = require('./src/validator/authentication')

exports.handler = async (event) => {
  let paymentObj = {}
  try {
    const body = event.body ? JSON.parse(event.body) : event
    paymentObj = body?.resource?.obj
    if (!paymentObj)
      return {
        responseType: 'FailedValidation',
        errors: [
          {
            code: 'InvalidInput',
            message: `Invalid event body`,
          },
        ],
      }

    const authToken = auth.getAuthorizationRequestHeader(event)
    const paymentResult = await paymentHandler.handlePayment(
      paymentObj,
      authToken
    )
    return {
      responseType: paymentResult.actions
        ? 'UpdateRequest'
        : 'FailedValidation',
      errors: paymentResult.errors,
      actions: paymentResult.actions || [],
    }
  } catch (e) {
    const errorObj = utils.handleUnexpectedPaymentError(paymentObj, e)
    errorObj.responseType = 'FailedValidation'
    return errorObj
  }
}
