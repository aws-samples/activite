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
import _ from "lodash";
import { Query } from '../services/AsyncApi'
/* eslint @typescript-eslint/no-var-requires: "off" */
const replace = require("frep");

export const createPathFromQuery = (query: Query) => {
    if (query.pathParams) {
        const replacements: { pattern: string; replacement: any }[] = [];
        /** create the replacements */
        _(query.pathParams).each((v: any, k: string) =>
            replacements.push({ pattern: k, replacement: v })
        );
        /** iterate through the params and run the replacement */
        return replace.strWithArr(query.path, replacements);
    } else {
        return query.path;
    }
}
