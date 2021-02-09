  /**
 * @swagger
 * /user/adminsignup:
 *  post:
 *    summary: New Admin Sing up endpoint
 *    tags: [Portal]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Adminsignup'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5xx':
 *        description: Unexpected server response
 *    deprecated: false
 * 
 */
  

  /**
 * @swagger
 * /user/adminlogin:
 *  post:
 *    summary: Admin Login
 *    tags: [Portal]
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *         schema:
 *           $ref: '#/components/schemas/Adminlogin'
 *    responses:
 *      '200':
 *        description: A successful response
 *      '5xx':
 *        description: Unexpected server response
 * 
 */
  /**
 * @swagger
 *  components:
 *    schemas:
 *      Adminsignup:
 *        type: object
 *        required:
 *          - email
 *          - password
 *          - password2
 *          - orgid
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *          password:
 *            type: string
 *          password2:
 *            type: string
 *        example:
 *           orgid: IMDA
 *           email: pia.jain@gmail.com
 *           password: "$iLoveLufthansa"
 *           password2: "$iLoveLufthansa"
 

  *      Adminlogin:
 *        type: object
 *        required:
 *          - email
 *          - password
 *          - orgid
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *          password:
 *            type: string
 *        example:
 *           orgid: IMDA
 *           email: pia.jain@gmail.com
 *           password: "$iLoveLufthansa"
 *         
 */