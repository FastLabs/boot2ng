angular.module('artifact', []).config(
    function() {

    }
).factory('artifact', function() {
        //adds an artifact to the collection
        var addArtifact = function (collection, artifact) {
            if (collection && artifact) {
                collection.push(artifact)
            }
        };
        //remove the artifact from the collection
        //at the moment it requires a mandatory attribute id

        //TODO: remove this the logic is moved to Collection repository
        var removeArtifact = function (collection, artifact) {
            console.log('atempt removing the artifact');
            if(collection  && artifact ) {
                var artifactId = artifact.attributes.id
                for(var i in collection) {
                    if(collection[i].attributes.id === artifactId) {
                        collection.splice(i, 1);
                    }
                }
            }
        };
        return {
            addArtifact: addArtifact,
            removeArtifact: removeArtifact
        }
    });