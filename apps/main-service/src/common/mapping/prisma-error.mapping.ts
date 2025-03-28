import { HttpStatus } from '@nestjs/common';
import { PRISMA_ERRORS } from '../messages/prisma.message';

const PRISMA_ERROR_MAPPING: Record<
  string,
  { status: number; message: string }
> = {
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.VALUE_TOO_LONG,
  },
  P2001: {
    status: HttpStatus.NOT_FOUND,
    message: PRISMA_ERRORS.RECORD_NOT_FOUND,
  },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED,
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.FOREIGN_KEY_CONSTRAINT_FAILED,
  },
  P2004: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.CONSTRAINT_FAILED,
  },
  P2005: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.INVALID_VALUE,
  },
  P2006: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.INVALID_PROVIDED_VALUE,
  },
  P2007: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.DATA_VALIDATION_ERROR,
  },
  P2008: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.QUERY_PARSE_FAILED,
  },
  P2009: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.QUERY_VALIDATION_FAILED,
  },
  P2010: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: PRISMA_ERRORS.RAW_QUERY_FAILED,
  },
  P2011: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.NULL_CONSTRAINT_FAILED,
  },
  P2012: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.MISSING_REQUIRED_VALUE,
  },
  P2013: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.MISSING_REQUIRED_ARGUMENT,
  },
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.RELATION_VIOLATION,
  },
  P2015: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.RELATED_RECORD_NOT_FOUND,
  },
  P2016: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.QUERY_INTERPRETATION_ERROR,
  },
  P2017: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.RELATION_NOT_CONNECTED,
  },
  P2018: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.CONNECTED_RECORDS_NOT_FOUND,
  },
  P2019: { status: HttpStatus.BAD_REQUEST, message: PRISMA_ERRORS.INPUT_ERROR },
  P2020: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.VALUE_OUT_OF_RANGE,
  },
  P2021: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.TABLE_NOT_FOUND,
  },
  P2022: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.COLUMN_NOT_FOUND,
  },
  P2023: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.INCONSISTENT_COLUMN_DATA,
  },
  P2024: {
    status: HttpStatus.REQUEST_TIMEOUT,
    message: PRISMA_ERRORS.CONNECTION_POOL_TIMEOUT,
  },
  P2025: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.OPERATION_FAILED,
  },
  P2026: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.UNSUPPORTED_FEATURE,
  },
  P2027: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: PRISMA_ERRORS.MULTIPLE_ERRORS,
  },
  P2028: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: PRISMA_ERRORS.TRANSACTION_API_ERROR,
  },
  P2029: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.QUERY_PARAMETER_LIMIT_EXCEEDED,
  },
  P2030: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.FULLTEXT_INDEX_NOT_FOUND,
  },
  P2031: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: PRISMA_ERRORS.MONGODB_REPLICA_SET_REQUIRED,
  },
  P2033: {
    status: HttpStatus.BAD_REQUEST,
    message: PRISMA_ERRORS.NUMBER_OUT_OF_RANGE,
  },
  P2034: { status: HttpStatus.CONFLICT, message: PRISMA_ERRORS.WRITE_CONFLICT },
  P2035: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: PRISMA_ERRORS.ASSERTION_VIOLATION,
  },
  P2036: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: PRISMA_ERRORS.EXTERNAL_CONNECTOR_ERROR,
  },
  P2037: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: PRISMA_ERRORS.TOO_MANY_CONNECTIONS,
  },
};

export default PRISMA_ERROR_MAPPING;
