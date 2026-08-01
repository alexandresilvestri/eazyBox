import type { Knex } from 'knex'
import _ from 'lodash'
import camelcaseKeys from 'camelcase-keys'

const followedByNumRegEx = /_(\d)/g

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

export const snakeCaseIgnoringNumbers = (value: string): string =>
	_.snakeCase(value).replace(followedByNumRegEx, '$1')

const postProcessResponse: Knex.Config['postProcessResponse'] = (result) => {
	if (result == null) {
		return result
	}

	if (Array.isArray(result)) {
		return result.map((row) => {
			if (isObject(row)) {
				const converted = camelcaseKeys(row)
				return converted
			}
			return row
		})
	}

	if (isObject(result)) {
		const converted = camelcaseKeys(result)
		return converted
	}

	return result
}

const wrapIdentifier: Knex.Config['wrapIdentifier'] = (value, origImpl) => {
	if (value === '*') {
		return origImpl(value)
	}

	return origImpl(snakeCaseIgnoringNumbers(value))
}

export const config: Knex.Config = {
	postProcessResponse,
	wrapIdentifier,
}

