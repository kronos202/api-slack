import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe';

export const lowerCaseTransformer = (
  params: TransformFnParams,
): MaybeType<string> => params.value?.toLowerCase().trim();
