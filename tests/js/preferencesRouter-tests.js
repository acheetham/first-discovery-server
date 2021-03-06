/*
Copyright 2015 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/fluid-project/first-discovery-server/raw/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
var jqUnit = require("jqUnit");
var kettle = require("kettle");

kettle.loadTestingSupport();

require("../../src/js/firstDiscoveryServer.js");
require("gpii-express/tests/js/lib/test-helpers.js");

fluid.registerNamespace("gpii.tests.firstDiscovery.server");

fluid.defaults("gpii.tests.firstDiscovery.server.request", {
    gradeNames: ["kettle.test.request.http"],
    path:       "http://localhost/user",
    port:       "{testEnvironment}.options.port"
});

gpii.tests.firstDiscovery.server.verifyJSONResponse = function (response, body, expectedResponse, expectedBody) {
    gpii.express.tests.helpers.isSaneResponse(jqUnit, response, body, 200);
    jqUnit.assertDeepEq("The body should be as expected...", expectedBody, JSON.parse(body));
};

fluid.defaults("gpii.tests.firstDiscovery.server", {
    gradeNames: ["gpii.firstDiscovery.server"],
    port: "{testEnvironment}.options.port",
    events: {
        onStarted: "{testEnvironment}.events.onStarted"
    }
});

fluid.defaults("gpii.tests.firstDiscovery.server.requestTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    events: {
        constructServer: null,
        onStarted: null
    },
    port: 8111,
    components: {
        express: {
            createOnEvent: "constructServer",
            type: "gpii.tests.firstDiscovery.server"
        },
        testCaseHolder: {
            type: "gpii.express.tests.caseHolder",
            options: {
                expected: {
                    response: 200,
                    body: {token: "mock-gpii-token"}
                },
                rawModules: [{
                    tests: [{
                        name: "Test ",
                        type: "test",
                        sequence: [{
                            func: "{jsonRequest}.send"
                        }, {
                            listener: "gpii.tests.firstDiscovery.server.verifyJSONResponse",
                            event:    "{jsonRequest}.events.onComplete",
                            args:     ["{jsonRequest}.nativeResponse", "{arguments}.0", "{testCaseHolder}.options.expected.response", "{testCaseHolder}.options.expected.body"]
                        }]
                    }]
                }],
                components: {
                    jsonRequest: {
                        type: "gpii.tests.firstDiscovery.server.request",
                        options: {
                            method: "POST",
                            headers: {
                                accept: "application/json"
                            }
                        }
                    }
                }
            }
        }
    }
});

fluid.test.runTests([
    "gpii.tests.firstDiscovery.server.requestTests"
]);
