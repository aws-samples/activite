/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.                                                                              *
 ******************************************************************************************************************** */
import { useState, useEffect } from "react";
import { UnitBase } from "@activejs/core";
import { AsyncApi } from 'activite'
/* eslint @typescript-eslint/ban-types: "off" */

const bind = <T extends Function>(method: T, thisArg: any): T =>
    method.bind(thisArg)

export type UnitValueType<T> = T extends UnitBase<infer X> ? X : never

export const useEntity = <S extends AsyncApi>(service: S, entity: string) => {

    const { query: entityQuery, pending: entityPending, error: entityError, data: entityData } = service.getEntity(entity)

    type T = typeof entityData
    const [data, setData] = useState<any>()
    const [pending, setPending] = useState<boolean>(false)
    const [error, setError] = useState<any>()

    useEffect(() => {
        const dataSubscription = entityData.subscribe(setData);
        const pendingSubscription = entityPending.subscribe(setPending);
        const errorSubscription = entityError.subscribe(setError)

        return () => {
            /** unsubscribe - if we dont we will get memory leak nastiness */
            dataSubscription.unsubscribe();
            pendingSubscription.unsubscribe();
            errorSubscription.unsubscribe();
        }
    }, [])

    return {
        data: entityData.value(),
        pending,
        error,
        dispatch: bind(entityQuery.dispatch, entityQuery),
        update: bind(entityData.dispatch, entityData),
        cache: {
            cachedValues: bind(entityData.cachedValues, entityData)(),
            cacheIndex: entityData.cacheIndex,
            cachedValuesCount: entityData.cachedValuesCount,
            latestData: bind(entityData.cachedValues, entityData)()[1],
            clear: bind(entityData.clearCache, entityData)
        }

    }
}