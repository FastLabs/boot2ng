angular.module('utils', []).config(
    function () {

    }
).factory('parser', function () {
        //splits the attributes name and value from a string representation
        // attribute_name: attribute value
        //take in consideration that in the future the value could be validated
        var splitAttribute = function (value) {
            if (value) {
                var separator = value.indexOf(':');
                var attributeName = value.substring(0, separator).trim();
                var attributeValue = value.substring(separator + 1, value.length);
                return {'name':attributeName, 'value':attributeValue };
            }
        }

        return {
            splitAttribute:splitAttribute
        };

    });
