/**
 * @swagger
 * tags:
 *   - name: SHN&QO
 *     description: Mobile Application
 *   - name: Dashboard
 *     description: API's for Dashboard or Visualization
 *   - name: Portal
 *     description: Admin & User portal
 *   - name: PushNotification
 *     description: Push notificaiton 
 * security:
 *  - bearerAuth[]
 */
/**
 * @swagger
 * /novel/getall/{pin}:
 *  get:
 *    summary: Get per pin trk, bipupdate,biopush
 *    tags: [SHN&QO]
 *    parameters:
 *    - in: path
 *      name: pin
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
// ========================================

// ========================================
/**
 * @swagger
 * /novel/get/{days}/{orgid}:
 *  get:
 *    summary: Get per pin trk, bipupdate,biopush
 *    tags: [Dashboard]
 *    parameters:
 *    - in: path
 *      name: days
 *      required: true
 *    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
// ==========================================
/**
 * @swagger
 * /novel/get/{days}/{orgid}/{pin}:
 *  get:
 *    summary: Get per pin trk, bipupdate,biopush
 *    tags: [Dashboard]
 *    parameters:
 *    - in: path
 *      name: days
 *      required: true
 *    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
  *    - in: path
 *      name: pin
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */


 /**
 * @swagger
 * /novel/config:
 *  get:
 *    summary: Get config
 *    tags: [SHN&QO]
 *    responses:
 *      '200':
 *        description: A successful response
 */

  /**
 * @swagger
 * /novel/changestartdate:
 *  post:
 *    summary: Change start date for the pin
 *    tags: [Portal]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Changestartdate'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5xx':
 *        description: Unexpected server response
 * 
 */

   /**
 * @swagger
 * /novel/changeenddate:
 *  post:
 *    summary: Change start date for the pin
 *    tags: [Portal]
 *    requestBody:
 *      required: true
 *      content:
*        application/json:
*         schema:
*          $ref: '#/components/schemas/Changestartdate'
*    responses:
*      '200':
*        description: A successful response
* 
*/

    /**
 * @swagger
 * /novel/update:
 *  post:
 *    summary: Update Heart beat
 *    tags: [SHN&QO]
 *    parameters:
 *    - name: update Heart Beat
 *    in: body
 *    schema:
 *      type: object
 *      properties:
 *       pin:
 *          type: string
 *       trk:
 *          type: array
 *    responses:
 *      '200':
 *        description: A successful response
 * 
 */

  /**
 * @swagger
 * /novel/pins:
 *  get:
 *    summary: Get all pins
 *    tags: [SHN&QO]
 *    responses:
 *      '200':
 *        description: A successful response
 */

   /**
 * @swagger
 * /novel/getallsuspendedpins:
 *  get:
 *    summary: Get all suspended pins for all orgid
 *    tags: [Portal]
 *    responses:
 *      '200':
 *        description: A successful response
 */

/**
 * @swagger
 * /novel/getallsuspendedpins/{bool}:
 *  get:
 *    summary: Get all suspended pins by bool value
 *    tags: [Portal]
 *    parameters:
 *    - in: path
 *      name: bool
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */


/**
 * @swagger
 * /novel/getallsuspendedpins/{bool}/{orgid}:
 *  get:
 *    summary: Get all suspended pins by Organization I'd
 *    tags: [Portal]
 *    parameters:
 *    - in: path
 *      name: bool
 *      required: true
*    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
   /**
 * @swagger
 * /novel/pins/{orgid}:
 *  get:
 *    summary: Get all pins by Organization Id
 *    tags: [Portal]
 *    parameters:
 *    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */

   /**
 * @swagger
 * /novel/getbiometric/{orgid}:
 *  get:
 *    summary: Get biometric info for all pins by Organization Id
 *    tags: [SHN&QO]
 *    parameters:
 *    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */

    /**
 * @swagger
 * /novel/getbyorg/{orgid}:
 *  get:
 *    summary: Get all pins by Organization Id
 *    tags: [Portal]
 *    parameters:
 *    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */

     /**
 * @swagger
 * /novel/getfloatingpins/{orgid}:
 *  get:
 *    summary: Get floating pins by Organization Id
 *    tags: [Portal]
 *    parameters:
 *    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
    /**
 * @swagger
 * /novel/updatepcode:
 *  post:
 *    summary: Update postal code for the pin
 *    tags: [SHN&QO]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          $ref: '#/components/schemas/Updatepcode'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */

    /**
 * @swagger
 * /novel/changeorgid:
 *  post:
 *    summary: Change OrgId via pin
 *    tags: [Portal]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          $ref: '#/components/schemas/Changeorgid'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */
     /**
 * @swagger
 * /novel/updatemyloc:
 *  post:
 *    summary: Change start date for the pin
 *    tags: [SHN&QO]
  *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Updatemyloc'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */

      /**
 * @swagger
 * /novel/ed-biometric:
 *  post:
 *    summary: Change start date for the pin
 *    tags: [Portal]
  *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Biometric'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */


      /**
 * @swagger
 * /novel/getbiometric/{orgid}:
 *  get:
 *    summary: Get floating pins by Organization Id
 *    tags: [SHN&QO]
 *    parameters:
 *    - in: path
 *      name: orgid
 *      required: true
 *      schema:
 *       type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */

     /**
 * @swagger
 * /novel/suspension:
 *  post:
 *    summary: Suspend array of pins
 *    tags: [Portal]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Pinsuspension'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */

     /**
 * @swagger
 * /novel/frsm:
 *  post:
 *    summary: Send DSTM urls to array of Mobile Numbers for Facial Recognition
 *    tags: [SHN&QO]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Frsm'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */

     /**
 * @swagger
 * /novel/dynamicpush:
 *  post:
 *    summary: Send dynamic push notification to selected mobile numbers in an array
 *    tags: [SHN&QO]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Dynamicpush'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */

     /**
 * @swagger
 * /novel/ping:
 *  post:
 *    summary: Push notification for array of pins
 *    tags: [SHN&QO]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Ping'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5XX':
 *        description: Unexpected server error.
 * 
 */

 /**
 * @swagger
 *  components:
 *    schemas:
 *      Novel:
 *        type: object
 *        required:
 *          - pin
 *          - newdate
 *        properties:
 *          pin:
 *            type: string
 *          newdate:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *        example:
 *           name: Alexander
 *           email: fake@email.com
 *      Changestartdate:
 *        type: object
 *        required:
 *          - pin
 *          - newdate
 *        properties:
 *          pin:
 *            type: string
 *          newdate:
 *            type: string
 *        example:
 *           pin: 61RG61VH
 *           newdate: 25-05-2020
 *      Updatemyloc:
 *        type: object
 *        required:
 *          - pin
 *          - lat
 *          - lng
 *        properties:
 *          pin:
 *            type: string
 *          lat:
 *            type: string
 *          lng:
 *            type: string
 *        example:
 *           pin: 61RG61VH
 *           lat: 130.869
 *           lng: 10.98

 *      Updatepcode:
 *        type: object
 *        required:
 *          - pin
 *          - pcode
 *        properties:
 *          pin:
 *            type: string
 *          pcode:
 *            type: string
 *        example:
 *           pin: PINILUFT
 *           pcode: 313138
 
*      Ping:
 *        type: object
 *        required:
 *          - arrayofpins
 *        properties:
 *          arrayofpins:
 *            type: array
 *            pins:
 *             type: string
 *     
 *        example:
 *           arrayofpins: ["61RG61VH","SOMEPINNAME" ]
 
 *      Frsm:
 *        type: object
 *        required:
 *          - arrayofmobiles
 *        properties:
 *          arrayofmobiles:
 *            type: array
 *            mobiles:
 *             type: string
 *     
 *        example:
 *           arrayofmobiles: ["6581397860","6581898994" ]

 *      Dynamicpush:
 *        type: object
 *        required:
 *          - arrayofmobiles
 *        properties:
 *          arrayofmobiles:
 *            type: array
 *            mobiles:
 *             type: string
 *     
 *        example:
 *           arrayofmobiles: ["6581397860","6581898994" ]
 *      Changeorgid:
 *        type: object
 *        required:
 *          - pin
 *          - orgid
 *        properties:
 *          pin:
 *            type: string
 *          orgid:
 *            type: string
 *        example:
 *           pin: 61RG61VH
 *           orgid: IMDA
 * 

 *      BiometricOrgid:
 *        type: object
 *        required:
 *          - pin
 *          - value
 *          - orgid
 *        properties:
 *          pin:
 *            type: string
 *          value:
 *            type: string
 *          orgid:
 *            type: string
 *        example:
 *           pin: 61RG61VH
 *           value: false
 
 *      Biometric:
 *        type: object
 *        required:
 *          - pin
 *          - value
 *        properties:
 *          pin:
 *            type: string
 *          value:
 *            type: string
 *        example:
 *           pin: 61RG61VH
 *           value: false
 
 *      Pinsuspension:
 *        type: object
 *        required:
 *          - pin
 *          - value
 *        properties:
 *          pin:
 *            type: array
 *            pins:
 *             type: string
 *          value:
 *            type: string
 *        example:
 *           pin: ["61RG61VH", "PINNAME"]
 *           value: false
 *    securitySchemes:
 *      bearerAuth:
 *          type: apiKey
 *          name: Authorization
 *          in: header
 *          scheme: bearer
 *          bearerFormat: JWT
 *          value: "Bearer "
 */


  /**
 * @swagger
 * securityDefinitions:
 *  jwt:
 *  type: jwt
 *  in: header
 *  name: Authorization
 */