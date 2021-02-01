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
import { DictUnit, GenericUnit, BoolUnit } from "@activejs/core";
import { EMPTY, Observable, of, throwError } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { catchError, filter, map, switchMap, tap } from "rxjs/operators";
import { merge } from "rxjs";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import BuildUrl from "build-url";
import _ from "lodash";
import { createPathFromQuery } from '../utils'
/**
 * Generic "Any" interface
 *
 * @export
 * @interface Any
 */
export interface Any {
  [key: string]: any
}
/**
 * Generic return type interface
 *
 * @export
 * @interface GenericReturn
 */
export interface GenericReturn<T> {
  [key: string]: T
}

export enum QueryMethod {
  'GET' = 'GET',
  'PUT' = 'PUT',
  'POST' = 'POST',
  'PATCH' = 'PATCH',
  'DELETE' = 'DELETE',
}
/**
 *
 *
 * @export
 * @interface Query
 * @extends {Any}
 */

export interface Query extends AxiosRequestConfig {
  path: string
  pathParams?: any
}
/**
 *
 *
 * @export
 * @interface AsyncServiceParams
 */
export interface AsyncApiParams {
  baseUrl: string
  port?: number
}
/**
 *
 *
 * @interface AddServiceReturn
 * @template D
 */
interface AddServiceReturn<D> {
  query: GenericUnit<Query>;
  data: GenericUnit<D>;
  error: DictUnit<any>;
  pending: BoolUnit;
}
/**
 * The Async Get Service
 *
 * @export
 * @class AsyncApi
 */
export class AsyncApi {
  /** the base url of the endpoint for the service */
  public baseUrl: string
  /** port for the end point */
  public port: number;
  /** axios intance */
  protected axiosInstance: AxiosInstance
  /** service parameters */
  protected params: AsyncApiParams;

  /** the units for the entity */
  protected entities: {
    [key: string]: {
      query: GenericUnit<Query>;
      data: GenericUnit<any>;
      error: DictUnit<any>;
      pending: BoolUnit;
    };
  };

  constructor(params: AsyncApiParams) {
    this.entities = {};
    this.params = params;
    this.baseUrl = params.baseUrl
    // TODO: This is bad - what about https ? be smarter
    this.port = params.port || 80;

    this.axiosInstance = axios.create({
      baseURL: `${this.baseUrl}:${this.port}`
    })

  }

  public addEntity<D>(name: string): AddServiceReturn<D> {

    if (this.entities[name])
      throw (`An entity with this name exists ${name}`)

    this.entities[name] = {
      query: new GenericUnit<Query>(),
      data: new GenericUnit<D>(),
      error: new DictUnit(),
      pending: new BoolUnit()
    };

    this.bind(name);
    return this.entities[name];
  }

  public removeEntity(name: string) {
    try {
      if (!this.entities[name])
        throw (`Unknown service entity - ${name}`)

      const { pending } = this.entities[name];
      /** check if there is something pending */
      const pendingSubscription = pending.subscribe(pending => {
        !pending && delete this.entities[name];
      });
    } catch (e) {
      throw (e)
    }
  }

  public getEntity(name: string) {
    if (!this.entities[name]) {
      throw (`Unknown service entity - ${name}`)
    } else {
      return this.entities[name]
    }
  }

  public getEntityNames() {
    return Object.keys(this.entities);
  }

  protected bind(name: string) {
    const { query: entityQuery, data, error, pending } = this.entities[name];

    merge(...[data.future$, error.future$]).subscribe(() =>
      pending.dispatch(false)
    );

    entityQuery.future$.subscribe(() => pending.dispatch(true));

    entityQuery.future$
      .pipe(
        /** filter out queries that are empty */
        filter(query => {
          if (Object.keys(query).length > 0) {
            /** only proceed if non-empty object */
            return true;
          } else {
            /** otherwise clear the output */
            data.clearValue();
            return false;
          }
        }),
        switchMap(query =>
          /** make the API call */
          this.getData(query).pipe(
            /** dispatch the results */
            tap(returnData => {
              data.dispatch(returnData.data)
            }),
            /** handle any errors */
            catchError(err => {
              /** dispatch the error */
              error.dispatch(err.response.data);
              /** don't let the parent pipe die */
              return EMPTY;
            })
          )
        )
        /** activate the stream */
      ).subscribe()
  }

  protected getData(
    query: Query,
  ): Observable<any> {

    const path = createPathFromQuery(query)

    /** construct the final URL */
    const url = BuildUrl(`${this.baseUrl}:${this.port}/${path}`)

    return fromPromise(
      this.axiosInstance({ ...query, url })
    ).pipe(
      map((res: any) => res),
      catchError((err, caught) => throwError(err))
    )
  }
}
