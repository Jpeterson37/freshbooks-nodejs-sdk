/* eslint-disable @typescript-eslint/camelcase */
import { DateFormat, transformDateRequest, transformDateResponse } from './Date'
import Detail, { transformDetailRequest, transformDetailResponse } from './Detail'
import { ErrorResponse, isAccountingErrorResponse, transformErrorResponse } from './Error'

export default interface JournalEntry {
    currencyCode: string
    description: string
    details: Detail[]
    entryId?: number
    id?: number
    name: string
    userEnteredDate: Date
}

export function transformJournalEntryData(entry: any): JournalEntry {
    return {
        currencyCode: entry.currency_code,
        description: entry.description,
        details: entry.details && entry.details.map((detail: any): Detail => transformDetailResponse(detail)),
        entryId: entry.entryid,
        id: entry.id,
        name: entry.name,
        userEnteredDate: entry.user_entered_date && transformDateResponse(entry.user_entered_date, DateFormat['YYYY-MM-DD']),
    }
}

export function transformJournalEntryResponse(data: string): JournalEntry | ErrorResponse {
    const response = JSON.parse(data)

    if (isAccountingErrorResponse(response)) {
        return transformErrorResponse(response)
    }

    const {
        response: {
            result: {journal_entry}
        }
    } = response

    return transformJournalEntryData(journal_entry)
}

export function transformJournalEntryRequest(entry: JournalEntry): string {
    return JSON.stringify({
        journal_entry: {
            currency_code: entry.currencyCode,
            description: entry.description,
            details: entry.details && entry.details.map((detail) => transformDetailRequest(detail)),
            name: entry.name,
            user_entered_date: entry.userEnteredDate && transformDateRequest(entry.userEnteredDate),
        }
    })
}
