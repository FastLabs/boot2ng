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
angular.module('hop.directives', [])
    .directive('hop', function () {
        return {
            restrict:'C',
            replace:true,

            scope:{title:'@hopTitle'},
            template:'<span>hello tag {{title}}</span>',
            link:function (scope, element, attrs) {
                console.log('linking');
            }
        }
    })
    .directive('keyPress', function () {
        return {
            link:function (scope, element, attrs) {
                console.log( attrs);

                element.bind('keydown', function () {
                    console.log('press');
                })
            }
        };
    });

