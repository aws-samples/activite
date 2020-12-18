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
import { test, expect, jest } from '@jest/globals';
import { AsyncApi, DynamoReturn } from '../index';
import { GenericUnit, BoolUnit, DictUnit } from '@activejs/core';
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
    testService = new TestService({ baseUrl: 'https://cat-fact.herokuapp.com' })
})

it('creates a test service class', () => {
    expect(testService).toBeInstanceOf(AsyncApi)
})

it('has the correct base url', () => {
    expect(testService.baseUrl).toMatch('https://cat-fact.herokuapp.com')
})

it('can add a new service entity', () => {
    testService.addEntity<TestServiceData<TestServiceDataItem>>("testEntityOne");
    const entityList = testService.getEntityNames()
    expect(entityList).toContain('testEntityOne')
})

it('can add multiple service entities', () => {
    testService.addEntity<TestServiceData<TestServiceDataItem>>("testEntityTwo");
    const entityList = testService.getEntityNames()
    expect(entityList).toEqual(['testEntityOne', 'testEntityTwo'])
})

it('throws if we try to add an entity with an existing name', () => {
    expect(() => testService.addEntity<TestServiceData<TestServiceDataItem>>("testEntityTwo")).toThrow()
})

it('fails when we try to remove an non-existant service entity', () => {
    expect(() => testService.removeEntity('testEntityThree')).toThrow()
})

it('can get a service entity by name', () => {
    const entity: any = testService.getEntity('testEntityTwo')
    expect(entity).toMatchObject(entity)
})

it('throws when trying to get an unknown entity', () => {
    expect(() => testService.getEntity('testEntityThree')).toThrow('Unknown service entity')
})

it('can remove a service entity', () => {
    testService.removeEntity('testEntityTwo')
    const entityList = testService.getEntityNames()
    expect(entityList).toEqual(['testEntityOne'])
})

it('has a new service entity with the right return types', () => {
    const { query: eventQuery, data: eventData, error, pending } = testService.addEntity<TestServiceData<TestServiceDataItem>>("testEntityThree");
    expect(eventQuery).toBeInstanceOf(GenericUnit)
    expect(eventData).toBeInstanceOf(GenericUnit)
    expect(error).toBeInstanceOf(DictUnit)
    expect(pending).toBeInstanceOf(BoolUnit)
})

it('can return an existing entity with the right return trype', () => {
    const { query, data, error, pending } = testService.getEntity("testEntityThree");
    expect(query).toBeInstanceOf(GenericUnit)
    expect(data).toBeInstanceOf(GenericUnit)
    expect(error).toBeInstanceOf(DictUnit)
    expect(pending).toBeInstanceOf(BoolUnit)
})


