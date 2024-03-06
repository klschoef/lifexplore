import {JsonObjects} from '../models/json/json-objects';
import {JsonConcepts} from '../models/json/json-concepts';
import {JsonTexts} from '../models/json/json-texts';

export default class DetectionUtil {
  static getDetectedObjects(jsonObjects: JsonObjects[]): string {
    const objectNames: string[] = jsonObjects.map((obj) => obj.object);
    return objectNames.join(', ');
  }

  static getDetectedConcepts(jsonConcepts: JsonConcepts[]): string {
    const conceptNames: string[] = jsonConcepts.map((obj) => obj.concept);
    return conceptNames.join(', ');
  }

  static getDetectedTexts(jsonTexts: JsonTexts[]): string {
    const textNames: string[] = jsonTexts.map((obj) => obj.text);
    return textNames.join(', ');
  }
}
