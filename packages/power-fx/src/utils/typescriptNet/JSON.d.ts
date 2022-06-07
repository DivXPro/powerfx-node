import Primitive from './Primitive'
import IMap from './IMap'

export type JsonEntry = Primitive | JsonArray | JsonMap

export declare type JsonArray = ArrayLike<JsonEntry>

export declare type JsonMap = IMap<JsonEntry>

export type JsonData = JsonMap | JsonArray | Primitive
