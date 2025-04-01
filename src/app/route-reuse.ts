import {ActivatedRouteSnapshot, BaseRouteReuseStrategy} from '@angular/router';
import {Injectable} from '@angular/core';

@Injectable()
export class CustomRouteReuseStrategy extends BaseRouteReuseStrategy {
  // When changing the router parameter, the component doesn't reinitialize by default. This forces reinitialization.
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return false;
  }
}
