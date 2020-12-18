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
import { expect, jest } from '@jest/globals';
import { AsyncApi, DynamoReturn } from '../';
import path from 'path'
import _ from 'lodash'
import * as jsonServer from 'json-server'
import { Server } from 'http';
import { QueryMethod } from '../lib/services/AsyncApi';
import { catchError, filter, map, switchMap, take, tap } from "rxjs/operators";



const port = 3000 //_.random(3000, 3010)
let restServer: Server
let running = 0;

beforeAll(() => {
    if (running === 0) {
        const server = jsonServer.create()
        const router = jsonServer.router(path.join(__dirname, 'db.json'))
        const middlewares = jsonServer.defaults()
        server.use(middlewares)
        server.use(router)
        try {
            restServer = server.listen(port)
        } catch (e) {
            console.log(e)
        }

        jest.setTimeout(20000)
    }

    running++

})

afterAll(() => { restServer.close() })

export interface TestServiceData<T> extends DynamoReturn {
    Items: T[];
}

export interface TestServiceDataItem {
    id: string
    name: string
}

let testService: AsyncApi

beforeAll(() => {
    class TestService extends AsyncApi { }
    testService = new TestService({
        baseUrl: `http://localhost`,
        port: port
    })
})

it('creates a test service class', () => {
    expect(testService).toBeInstanceOf(AsyncApi)
})


it('can add a new service entity', () => {
    testService.addEntity<TestServiceData<TestServiceDataItem>>("testEntityOne");
    testService.addEntity<TestServiceData<TestServiceDataItem>>("testEntityTwo");
    testService.addEntity<TestServiceData<TestServiceDataItem>>("testEntityThree");

    const entityList = testService.getEntityNames()

    expect(entityList).toEqual([
        'testEntityOne',
        'testEntityTwo',
        'testEntityThree'
    ])
})


it('can dispatch a query without params', (done) => {
    const { query, pending, data } = testService.getEntity("testEntityOne");

    const sub = data.future$.subscribe((val) => {
        expect(pending.value()).toBe(false)
        expect(data.value().length).toBeGreaterThanOrEqual(1)
        sub.unsubscribe()
        done()
    })


    query.dispatch({ path: "posts" })
})

it('can dispatch a query with params', (done) => {
    const { query, pending, data } = testService.getEntity("testEntityTwo");

    query.future$.subscribe(query => {
        expect(pending.value()).toBe(true)
    })

    const subscription = data.future$.subscribe(val => {
        expect(pending.value()).toBe(false)
        expect(val).toHaveProperty('id')
        expect(val.id).toBe(1)
        subscription.unsubscribe()
        done()
    })

    query.dispatch({ path: "posts/:id", pathParams: { ":id": '1' } })
})

it('can dispatch a POST', (done) => {
    const { query, pending, data } = testService.getEntity("testEntityThree");

    const subscription = data.future$.subscribe(val => {
        expect(pending.value()).toBe(false)
        expect(val).toHaveProperty('a')
        subscription.unsubscribe()
        done()
    })

    query.dispatch(
        {
            path: "posts",
            method: 'post',
            data: { a: 'b' }
        }
    )
})

it('can dispatch a PUT', (done) => {
    const { query, pending, data } = testService.getEntity("testEntityThree");

    const subscription = data.future$.subscribe(val => {
        expect(pending.value()).toBe(false)
        expect(val).toEqual({ "a": "updated", "id": 2 })
        subscription.unsubscribe()
        done()
    })

    query.dispatch(
        {
            path: "posts/:id",
            pathParams: {
                ":id": 2
            },
            method: QueryMethod.PUT,
            data: { a: 'updated' }
        }
    )
})

it('can dispatch a DELETE', (done) => {
    const { query, pending, data } = testService.getEntity("testEntityOne");

    const subscription = data.future$.subscribe(val => {
        expect(pending.value()).toBe(false)
        expect(val).toEqual({})
        subscription.unsubscribe()
        done()

    })

    query.dispatch(
        {
            path: "posts/:id",
            pathParams: {
                ":id": 2
            },
            method: QueryMethod.DELETE
        }
    )
})


