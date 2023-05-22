import lowerCaseFirstLetter from './lowerCaseFirstLetter';
import upperCaseFirstLetter from './upperCaseFirstLetter';

// kebab case to camel case
export default (str: string) =>
    lowerCaseFirstLetter(str.split('-').map(upperCaseFirstLetter).join(''));
