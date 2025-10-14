/*
    Some utility/shared functions for the custom LogUI Event handlers, used by odo-bot.
    
    @author: Alex Ianta
    @date: 2023-02-06

*/

/**
 * A list of dom properties to log when including the root element in a custom event.
 */
export const _root_dom_properties = [
    'outerHTML',
    'outerText',
]

/**
 * A list of dom properties to log when including an element in a custom event.
 */
export const _dom_properties = [
    'xpath',
    'URL',
    'baseURI',
    'attributes',
    'childElementCount',
    'id',
    'className',
    'localName',
    'nodeName',
    'offsetHeight',
    'offsetWidth',
    'title',
    'tagName'
]

/**
 * An extended list of dom properties to log when including particular elements of interest in a custom event.
 */
export {_dom_properties_ext} 

const _dom_properties_ext = [..._dom_properties]
_dom_properties_ext.push('outerHTML', 'outerText', 
    'checked', 'role', 'disabled', 'placeholder', 'required', 'type', 'name', 'selected', 'label'
)


/**
 * An extended list of dom properties to log when including input elements in a custom event.
 */
const _dom_properties_input_ext = [..._dom_properties_ext]
_dom_properties_input_ext.push('value', 'valueAsDate', 'valueAsNumber', 'willValidate')

/**
 * A function that computes the XPath of a given element
 * https://stackoverflow.com/questions/3454526/how-to-calculate-the-xpath-position-of-an-element-using-javascript
 */
export const getElementTreeXPath = function(element)
        {
            var paths = [];  // Use nodeName (instead of localName) 
            // so namespace prefix is included (if any).
            for (; element && element.nodeType == Node.ELEMENT_NODE; 
                element = element.parentNode)
            {
                var index = 0;
                var hasFollowingSiblings = false;
                for (var sibling = element.previousSibling; sibling; 
                    sibling = sibling.previousSibling)
                {
                    // Ignore document type declaration.
                    if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                        continue;

                    if (sibling.nodeName == element.nodeName)
                        ++index;
                }

                for (var sibling = element.nextSibling; 
                    sibling && !hasFollowingSiblings;
                    sibling = sibling.nextSibling)
                {
                    if (sibling.nodeName == element.nodeName)
                        hasFollowingSiblings = true;
                }

                var tagName = (element.prefix ? element.prefix + ":" : "") 
                                + element.localName;
                var pathIndex = (index || hasFollowingSiblings ? "[" 
                        + (index + 1) + "]" : "");
                paths.splice(0, 0, tagName + pathIndex);
            }

            return paths.length ? "/" + paths.join("/") : null;
        };