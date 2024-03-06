export default class QueryUtil {
  static addToQuery(query: string, prefix:string, name:string): string {
    if (query.includes('-' + prefix + ' ')) {
      return query.replace('-' + prefix + ' ', '-' + prefix + ' ' + name + ',');
    } else {
      return '-' + prefix + ' ' + name + ' ' + query;
    }
  }

  static delFromQuery(query: string, prefix:string, name:string) {
    if (query.includes('-' + prefix + ' ')) {
      if (query.indexOf('-' + prefix + ' ' + name + ' ') >= 0) {
        query = query.replace('-' + prefix + ' ' + name + ' ', '');
      } else if (query.indexOf(name + ',') >= 0) {
        query = query.replace(name + ',', '');
      } else if (query.indexOf(',' + name) >= 0) {
        query = query.replace(',' + name, '');
      } else if (query.indexOf('-' + prefix + ' ' + name) >= 0) {
        query = query.replace('-' + prefix + ' ' + name, '');
      } else if (query.indexOf(name + ' ') >= 0) {
        query = query.replace(name + ' ', ' ');
      }
    }
    return query;
  }

  static getQueryValueFromParams(params: any): [string?, string?] {
    if ('filename' in params) {
      return ['filename', '-fn ' + params['filename']];
    }
    else if ('objects' in params) {
     return ['objects', '-o ' + params['objects']];
    }
    else if ('places' in params) {
      return ['places', '-p' + params['places']];
    }
    else if ('concepts' in params) {
      let paramConcept = params['concepts'];
      return ['concepts', '-c ' + params['concepts']];
    }
    else if ('texts' in params) {
      let paramText = params['texts'];
      return ['texts', '-t ' + params['texts']];
    }
    else if ('similarto' in params) {
      return ['similarto', params['similarto']];
    }
    return [undefined, undefined];
  }
}
