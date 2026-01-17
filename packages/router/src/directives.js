/**
 * @typedef {import("@webly/rebind").Directives} Directives
 */
 
import {watch} from "@webly/rebind"
 
/** @type {Directives} */
 export default {
"router-view": ({ rootState, scopes, element }) => {
    /** @type {((c: CustomElementConstructor) => void) | null} */
    let update = null;

    const fragmentChildNodes = document.createDocumentFragment()
    fragmentChildNodes.append(...element.childNodes)

    watch(async () => {
      const componentConstructor = Router.components.view
      if (!componentConstructor) return

      let constr = componentConstructor as htmz.ComponentConstructor
      if (!htmz.isComponentConstructor(componentConstructor)) {
        constr = await componentConstructor.bind({ params: Router.params })()
      }

      htmz.defineComponent(constr)

      const component = new constr();
      if (!component.root) throw new Error("property `root` on routerview component is undefined")

      htmz.init(component.root)
        .data(rootState, ...(scopes ?? []), component.data, { $params: Router.params })
        .components({ ...components, ...constr.components })
        .directives({ ...directives, ...constr.directives })
        .walk();

      if (update) return update(component)
      moveChildNodes(component, element.childNodes)

      element.replaceChildren(component);
    })

    update = (component) => {
      if (element.firstElementChild) {
        htmz.moveChildNodes(component, element.firstElementChild.childNodes)
      }
      element.replaceChildren(component)
    }
}
  
 }
