import Elasticsearch from "./elasticsearch";

export default async (client: Elasticsearch) => ({
  "openapi": "3.0.1",
  "info": {
    "title": "External API CESSDA",
    "description": "This is an external API for CESSDA Data Catalogue",
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    },
    "version": "1"
  },
  "externalDocs": {
    "description": "Visit the CESSDA DC",
    "url": "https://datacatalogue.cessda.eu/"
  },
  "servers": [
    {
      "url": "/api/DataSets/v2"
    }
  ],
  "tags": [
    {
      "name": "DataSets",
      "description": "Records in Data Catalogue"
    }
  ],
  "paths": {
    "/search": {
      "get": {
        "tags": [
          "DataSets"
        ],
        "summary": "Search for records in catalogue",
        "description": "Multiple status values can be provided with comma separated strings",
        "operationId": "findRecordsByQuery",
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "description": "The search query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "classifications",
            "in": "query",
            "description": "Topic classifications",
            "required": false,
            "style": "form",
            "explode": true,
            "schema": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "(In-job) training",
                  "Accidents and injuries",
                  "Accidents and injuries - Health",
                  "Administrative history - History",
                  "Advertising",
                  "Agricultural Science",
                  "Agricultural and Veterinary sciences"
                ]
              }
            }
          },
          {
            "name": "studyAreaCountries",
            "in": "query",
            "description": "Countries the study took place",
            "required": false,
            "style": "form",
            "explode": true,
            "schema": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": await client.getListOfCountries()
              }
            }
          },
          {
            "name": "publishers",
            "in": "query",
            "description": "Publishers of the study",
            "required": false,
            "style": "form",
            "explode": true,
            "schema": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": await client.getSourceRepositoryNames()
              }
            }
          },
          {
            "name": "dataCollectionYearMin",
            "in": "query",
            "description": "Date of Collection Minimum Year",
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "dataCollectionYearMax",
            "in": "query",
            "description": "Date of Collection Maximum Year",
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "The numbers of items to return. Max 200",
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "description": "The number of items to skip before starting to collect the result set",
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "keywords",
            "in": "query",
            "description": "keywords available in study",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "metadataLanguage",
            "in": "query",
            "description": "Language to display:\n  * `cs` - Czech\n  * `da` - Danish\n  * `nl` - Dutch\n  * `en` - English\n  * `fi` - Finish\n  * `fr` - French\n  * `de` - German\n  * `el` - Greek\n  * `sk` - Slovakian\n  * `sl` - Slovenian\n  * `sv` - Swedish\n",
            "required": true,
            "schema": {
              "type": "string",
              "enum": await client.getListOfMetadataLanguages()
            }
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "ResultsFound": {
                      "type": "object",
                      "properties": {
                        "value": {
                          "type": "number",
                          "example": 29
                        },
                        "relation": {
                          "type": "string",
                          "example": "eq"
                        }
                      }
                    },
                    "Results": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/DataSets"
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "example": {
                  "message": "Please provide a search language"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "DataSets": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "UKDS__4929"
          },
          "code": {
            "type": "string",
            "example": "UKDS"
          },
          "creators": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "Fraser, R"
            }
          },
          "dataCollectionPeriodStartdate": {
            "type": "string",
            "example": "1984-01-01T00:00:00Z"
          },
          "dataCollectionPeriodEnddate": {
            "type": "string",
            "example": "1985-01-01T00:00:00Z"
          },
          "dataCollectionYear": {
            "type": "integer",
            "example": 1984
          },
          "dataCollectionFreeTexts": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "dataCollectionFreeText": {
                  "type": "string",
                  "example": "1984"
                },
                "event": {
                  "type": "string",
                  "example": "start"
                }
              }
            }
          },
          "dataAccessFreeTexts": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "The depositor has specified that registration is required and ..."
            }
          },
          "publicationYear": {
            "type": "string",
            "example": "2005-04-11T00:00:00Z"
          },
          "typeOfModeOfCollections": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "vocab": {
                  "type": "string"
                },
                "vocabUri": {
                  "type": "string"
                },
                "id": {
                  "type": "string"
                },
                "term": {
                  "type": "string",
                  "example": "Face-to-face interview"
                }
              }
            }
          },
          "keywords": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "vocab": {
                  "type": "string",
                  "example": "YEAR"
                },
                "vocabUri": {
                  "type": "string"
                },
                "id": {
                  "type": "string"
                },
                "term": {
                  "type": "string",
                  "example": "1945"
                }
              }
            }
          },
          "samplingProcedureFreeTexts": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "Purposive selection/case studies"
            }
          },
          "classifications": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "vocab": {
                  "type": "string",
                  "example": "CESSDA Topic Classification"
                },
                "vocabUri": {
                  "type": "string",
                  "example": "urn:ddi:int.cessda.cv:TopicClassification:4.1"
                },
                "id": {
                  "type": "string"
                },
                "term": {
                  "type": "string",
                  "example": "LawCrimeAndLegalSystems.CrimeAndLawEnforcement"
                }
              }
            }
          },
          "abstract": {
            "type": "string"
          },
          "titleStudy": {
            "type": "string",
            "example": "1968: A Student Generation in Revolt, 1945-1985"
          },
          "studyUrl": {
            "type": "string",
            "example": "http://doi.org/10.5255/UKDA-SN-4929-1"
          },
          "studyNumber": {
            "type": "string",
            "example": "4929"
          },
          "typeOfTimeMethods": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "vocab": {
                  "type": "string"
                },
                "vocabUri": {
                  "type": "string"
                },
                "id": {
                  "type": "string"
                },
                "term": {
                  "type": "string",
                  "example": "Cross-sectional (one-time) study"
                }
              }
            }
          },
          "fileLanguages": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "en"
            }
          },
          "publisher": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "abbr": {
                  "type": "string",
                  "example": "UKDS"
                },
                "publisher": {
                  "type": "string",
                  "example": "UK Data Service"
                }
              }
            }
          },
          "studyAreaCountries": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "abbr": {
                  "type": "string",
                  "example": "PT"
                },
                "searchField": {
                  "type": "string",
                  "example": "Portugal"
                },
                "country": {
                  "type": "string",
                  "example": "Great Britain"
                }
              }
            }
          },
          "unitTypes": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "vocab": {
                  "type": "string"
                },
                "vocabUri": {
                  "type": "string"
                },
                "id": {
                  "type": "string"
                },
                "term": {
                  "type": "string",
                  "example": "EventOrProcessOrActivity"
                }
              }
            }
          },
          "pidStudies": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "pid": {
                  "type": "string",
                  "example": "APIS0066"
                }
              }
            }
          },
          "lastModified": {
            "type": "string",
            "example": "2021-09-17T14:44:09Z"
          },
          "isActive": {
            "type": "boolean"
          },
          "langAvailableIn": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "en"
            }
          }
        }
      }
    }
  }
});
