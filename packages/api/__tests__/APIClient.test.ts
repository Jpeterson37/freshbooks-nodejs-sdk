import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import APIClient, { Options } from '../src/APIClient'
import { APIClientConfigError } from '../src/models/Error'

const mock = new MockAdapter(axios) // set mock adapter on default axios instance
const clientId = 'test-client-id'
const testOptions: Options = { accessToken: 'token' }

describe('@freshbooks/api', () => {
	describe('Client', () => {
		test('Default init', () => {
			const client = new APIClient(clientId, testOptions)
			expect(client).not.toBeNull()
		})

		test('Test user agent when set returns correct value', () => {
			const client: APIClient = new APIClient(clientId, testOptions)
			expect(client.clientId).toEqual('test-client-id')
		})

		test('Test client config errors, missing redirect URI', async () => {
			const client = new APIClient(clientId, {
				clientSecret: 'token',
			})

			try {
				await client.getAuthRequestUrl()
			} catch (err: any) {
				expect(err).toBeInstanceOf(APIClientConfigError)
				expect(err.message).toEqual('redirectUri must be configured')
			}
		})

		test('Test client config errors, missing client secret', async () => {
			const client = new APIClient(clientId, {
				redirectUri: 'https://example.com',
			})

			try {
				await client.getAccessToken('code')
			} catch (err: any) {
				expect(err).toBeInstanceOf(APIClientConfigError)
				expect(err.message).toEqual('clientSecret must be configured')
			}
		})

		test('Test getting access token', async () => {
			mock.onPost('/auth/oauth/token').replyOnce(
				200,
				JSON.stringify({
					access_token: 'access-token',
					token_type: 'Bearer',
					expires_in: 100,
					refresh_token: 'refresh-token',
					scope: 'scopes',
					created_at: 300,
				})
			)

			const client = new APIClient(clientId, {
				clientSecret: 'secret',
				redirectUri: 'https://example.com',
			})

			const data = await client.getAccessToken('code')
			expect(data).toMatchObject({
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
				accessTokenExpiresAt: new Date(400000),
			})
		})

		test('Test unauthorized request', async () => {
			mock
				.onGet('/auth/api/v1/users/me')
				.replyOnce(
					401,
					'{"error":"unauthenticated","error_description":"This action requires authentication to continue."}'
				)

			const client = new APIClient(clientId, testOptions)
			try {
				await client.users.me()
			} catch (err: any) {
				expect(err.code).toEqual('unauthenticated')
				expect(err.message).toEqual('This action requires authentication to continue.')
			}
		})

		test('Test freshbook API errors', async () => {
			const mockResponse = JSON.stringify({
				response: {
					errors: [
						{
							message: 'The server could not verify that you are authorized to access the URL requested.',
							errno: 1003,
						},
					],
				},
			})
			mock.onGet('/accounting/account/zDmNq/invoices/invoices').replyOnce(401, mockResponse)

			const client = new APIClient(clientId, testOptions)
			try {
				await client.invoices.list('zDmNq')
			} catch (error: any) {
				expect(error.name).toEqual('List Invoices')
				expect(error.code).toEqual('401')
				expect(error.errors).toEqual([
					{
						number: 1003,
						message: 'The server could not verify that you are authorized to access the URL requested.',
					},
				])
			}
		})

		test('Test not found errors', async () => {
			const mockResponse = JSON.stringify({
				// eslint-disable-next-line @typescript-eslint/camelcase
				error_type: 'not_found',
				message: 'The requested resource was not found.',
			})
			mock.onGet('/accounting/account/zDmNq/invoices/invoices/1').replyOnce(401, mockResponse)

			const client = new APIClient(clientId, testOptions)
			try {
				await client.invoices.single('zDmNq', '1')
			} catch (error: any) {
				expect(error.code).toEqual('not_found')
				expect(error.message).toEqual('The requested resource was not found.')
			}
		})

		test('Test unhandled errors', async () => {
			const unhandledError = new Error('Unhandled Error!')
			const client = new APIClient(clientId, testOptions)

			// mock list method
			client.invoices.list = jest.fn(() => {
				throw unhandledError
			})

			try {
				await client.invoices.list('zDmNq')
			} catch (error) {
				expect(error).toBe(unhandledError)
			}
		})

		test('Test failed request retry', async () => {
			mock
				.onGet('/auth/api/v1/users/me')
				.replyOnce(500, '{"error":"internal_server_error","error_description":"internal server error"}')
				.onGet('/auth/api/v1/users/me')
				.replyOnce(
					200,
					`{
					"response":{
					   "id":2192788}}`
				)

			const client = new APIClient(clientId, testOptions)
			const res = await client.users.me()

			expect(res.ok).toBeTruthy()
			expect(res.error).toBeUndefined()
			expect(res.data).not.toBeUndefined()
		})

		test('Test rate limited request retry', async () => {
			mock
				.onGet('/auth/api/v1/users/me')
				.replyOnce(429, '{"error":"internal_server_error","error_description":"internal server error"}')
				.onGet('/auth/api/v1/users/me')
				.replyOnce(
					200,
					`{
                    "response":{
                       "id":2192788}}`
				)

			const client = new APIClient(clientId, testOptions)
			const res = await client.users.me()

			expect(res.ok).toBeTruthy()
			expect(res.error).toBeUndefined()
			expect(res.data).not.toBeUndefined()
		})

		test('Test pagination', async () => {
			const accountId = 'xZNQ1X'
			mock
				.onGet(`/accounting/account/${accountId}/invoices/invoices`)
				.replyOnce(200, '{"response":{"result":{"invoices": [],"page": 1,"pages": 1,"per_page": 15,"total": 7}}}')

			const client = new APIClient(clientId, testOptions)
			const res = await client.invoices.list('xZNQ1X')
			expect(res.ok).toBeTruthy()
			expect(res.data).not.toBeUndefined()

			if (res.data) {
				expect(res.data.pages).not.toBeUndefined()
			}
		})
	})
})
