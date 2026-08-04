import type { Knex } from 'knex'

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

export const snakeCaseIgnoringNumbers = (value: string): string =>
	value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

const camelCase = (value: string): string =>
	value.replace(/_([a-zA-Z0-9])/g, (_match, char) => char.toUpperCase())

const camelCaseKeys = (row: Record<string, unknown>): Record<string, unknown> =>
	Object.fromEntries(Object.entries(row).map(([key, value]) => [camelCase(key), value]))

const postProcessResponse: Knex.Config['postProcessResponse'] = (result) => {
	if (result == null) {
		return result
	}

	if (Array.isArray(result)) {
		return result.map((row) => {
			if (isObject(row)) {
				const converted = camelCaseKeys(row)
				return converted
			}
			return row
		})
	}

	if (isObject(result)) {
		const converted = camelCaseKeys(result)
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

