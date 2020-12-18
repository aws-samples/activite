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
/* istanbul ignore file */
import { useState, useEffect } from "react";
import { UnitBase } from "@activejs/core";

/* eslint @typescript-eslint/ban-types: "off" */
const bind = <T extends Function>(method: T, thisArg: any): T =>
    method.bind(thisArg)

export type UnitValueType<T> = T extends UnitBase<infer X> ? X : never

export function useUnit<U extends UnitBase<any>>(unit: U) {
    type T = UnitValueType<U>
    const [value, setValue] = useState<T>()

    useEffect(() => {
        const subscription = unit.subscribe(setValue);
        return () => subscription.unsubscribe();
    }, [])

    return {
        value,
        dispatch: bind(unit.dispatch, unit),
        resetValue: bind(unit.resetValue, unit)
    }
}