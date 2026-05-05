import Elasticsearch from "./elasticsearch";

export default async (client: Elasticsearch) => ({
  "openapi": "3.0.3",
  "info": {
    "title": "CESSDA DC SearchAPI",
    "description": "This is an external Search API for CESSDA Data Catalogue",
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    },
    "version": "2"
  },
  "externalDocs": {
    "description": "Visit the CESSDA Data Catalogue",
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
                    "SearchTerms": {
                      "type": "object",
                      "properties": {
                        "metadataLanguage": {
                          "type": "string",
                          "example": "en"
                        },
                        "limit": {
                          "type": "number",
                          "example": 200
                        },
                        "offset": {
                          "type": "number",
                          "example": 400
                        }
                      }
                    },
                    "ResultsCount": {
                      "type": "object",
                      "properties": {
                        "from": {
                          "type": "number",
                          "example": 400
                        },
                        "to": {
                          "type": "number",
                          "example": 600
                        },
                        "retrieved": {
                          "type": "number",
                          "example": 200
                        },
                        "available": {
                          "type": "number",
                          "example": 25848
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
          "abstract": {
            "type": "string"
          },
          "classifications": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "term": {
                  "type": "string",
                  "example": "LawCrimeAndLegalSystems.CrimeAndLawEnforcement"
                },
                "vocab": {
                  "type": "string",
                  "example": "CESSDA Topic Classification"
                },
                "vocabUri": {
                  "type": "string",
                  "example": "urn:ddi:int.cessda.cv:TopicClassification:4.1"
                }
              }
            }
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
          "dataAccessFreeTexts": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "The depositor has specified that registration is required and ..."
            }
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
          "dataCollectionPeriodEnddate": {
            "type": "string",
            "example": "1985-01-01T00:00:00Z"
          },
          "dataCollectionPeriodStartdate": {
            "type": "string",
            "example": "1984-01-01T00:00:00Z"
          },
          "dataCollectionYear": {
            "type": "integer",
            "example": 1984
          },
          "fileLanguages": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "en"
            }
          },
          "id": {
            "type": "string",
            "example": "UKDS__4929"
          },
          "isActive": {
            "type": "boolean"
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
          "langAvailableIn": {
            "type": "array",
            "items": {
              "type": "string",
              "example": "en"
            }
          },
          "lastModified": {
            "type": "string",
            "example": "2021-09-17T14:44:09Z"
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
          "publicationYear": {
            "type": "string",
            "example": "2005-04-11T00:00:00Z"
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
          "publisherFilter": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "abbr": {
                  "type": "string",
                  "example": "DANS"
                },
                "publisher": {
                  "type": "string",
                  "example": "DANS-KNAW"
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
          "studyNumber": {
            "type": "string",
            "example": "oai:easy.dans.knaw.nl:easy-dataset:158567"
          },
          "studyUrl": {
            "type": "string",
            "example": "http://doi.org/10.5255/UKDA-SN-4929-1"
          },
          "studyXmlSourceUrl": {
            "type": "string",
            "example": "https://easy.dans.knaw.nl/oai/?verb=GetRecord&identifier=oai%3Aeasy.dans.knaw.nl%3Aeasy-dataset%3A158567&metadataPrefix=oai_ddi25_en\""
          },
          "titleStudy": {
            "type": "string",
            "example": "1968: A Student Generation in Revolt, 1945-1985"
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
          "typeOfSamplingProcedures": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "vocab": {
                  "type": "string",
                  "example": "DDI Sampling Procedure"
                },
                "vocabUri": {
                  "type": "string",
                  "example": "https://vocabularies.cessda.eu/v2/vocabularies/SamplingProcedure/1.1?languageVersion=en-1.1"
                },
                "id": {
                  "type": "string"
                },
                "term": {
                  "type": "string",
                  "example": "Purposive selection/case studies"
                }
              }
            }
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
          "universe": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "inclusion": {
                  "type": "string",
                  "example": "Eligible voters"
                }
              }
            }
          }
        }
      }
    }
  }
});