define(["require", "exports", "angular", "../../services/AccessControlService"], function (require, exports, angular, AccessControlService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var moduleName = require('feed-mgr/datasources/module-name');
    /**
     * Identifier for this page.
     * @type {string}
     */
    var PAGE_NAME = "datasources";
    var DatasourcesListController = /** @class */ (function () {
        /**
         * Displays a list of data sources.
         *
         * @constructor
         * @param $scope the application model
         * @param {AccessControlService} AccessControlService the access control service
         * @param AddButtonService the Add button service
         * @param DatasourcesService the data sources service
         * @param PaginationDataService the table pagination service
         * @param StateService the page state service
         * @param TableOptionsService the table options service
         */
        function DatasourcesListController($scope, accessControlService, AddButtonService, DatasourcesService, PaginationDataService, StateService, TableOptionsService) {
            this.$scope = $scope;
            this.accessControlService = accessControlService;
            this.AddButtonService = AddButtonService;
            this.DatasourcesService = DatasourcesService;
            this.PaginationDataService = PaginationDataService;
            this.StateService = StateService;
            this.TableOptionsService = TableOptionsService;
            var self = this;
            /**
             * Page title.
             * @type {string}
             */
            self.cardTitle = "Data Sources";
            /**
             * Index of the current page.
             * @type {number}
             */
            self.currentPage = PaginationDataService.currentPage(PAGE_NAME) || 1;
            /**
             * List of data sources.
             * @type {Array.<Object>}
             */
            self.datasources = [];
            /**
             * Helper for table filtering.
             * @type {*}
             */
            self.filter = PaginationDataService.filter(PAGE_NAME);
            /**
             * Indicates that the data source is being loaded.
             * @type {boolean}
             */
            self.loading = true;
            /**
             * Identifier for this page.
             * @type {string}
             */
            self.pageName = PAGE_NAME;
            /**
             * Helper for table pagination.
             * @type {*}
             */
            self.paginationData = (function () {
                var paginationData = PaginationDataService.paginationData(PAGE_NAME);
                PaginationDataService.setRowsPerPageOptions(PAGE_NAME, ['5', '10', '20', '50']);
                return paginationData;
            })();
            /**
             * Options for sorting the table.
             * @type {*}
             */
            self.sortOptions = (function () {
                var fields = { "Name": "name", "Description": "description", "Related Feeds": "sourceForFeeds.length", "Type": "type" };
                var sortOptions = TableOptionsService.newSortOptions(PAGE_NAME, fields, "name", "asc");
                var currentOption = TableOptionsService.getCurrentSort(PAGE_NAME);
                if (currentOption) {
                    TableOptionsService.saveSortOption(PAGE_NAME, currentOption);
                }
                return sortOptions;
            })();
            /**
             * Type of view for the table.
             * @type {any}
             */
            self.viewType = PaginationDataService.viewType(PAGE_NAME);
            /**
             * Navigates to the details page for the specified data source.
             *
             * @param {Object} datasource the data source
             */
            self.editDatasource = function (datasource) {
                StateService.FeedManager().Datasource().navigateToDatasourceDetails(datasource.id);
            };
            /**
             * Gets the number of related feeds for the specified data source.
             *
             * @param {Object} datasource the data source
             * @returns {number} the number of related feeds
             */
            self.getRelatedFeedsCount = function (datasource) {
                return angular.isArray(datasource.sourceForFeeds) ? datasource.sourceForFeeds.length : 0;
            };
            /**
             * Updates the order of the table.
             *
             * @param order the sort order
             */
            self.onOrderChange = function (order) {
                PaginationDataService.sort(self.pageName, order);
                TableOptionsService.setSortOption(self.pageName, order);
            };
            /**
             * Updates the pagination of the table.
             *
             * @param page the page number
             */
            self.onPaginationChange = function (page) {
                PaginationDataService.currentPage(self.pageName, null, page);
                self.currentPage = page;
            };
            /**
             * Updates the order of the table.
             *
             * @param option the sort order
             */
            self.selectedTableOption = function (option) {
                var sortString = TableOptionsService.toSortString(option);
                PaginationDataService.sort(self.pageName, sortString);
                TableOptionsService.toggleSort(self.pageName, option);
                TableOptionsService.setSortOption(self.pageName, sortString);
            };
            // Notify pagination service of changes to view type
            $scope.$watch(function () {
                return self.viewType;
            }, function (viewType) {
                PaginationDataService.viewType(PAGE_NAME, viewType);
            });
            // Register Add button
            accessControlService.getUserAllowedActions()
                .then(function (actionSet) {
                if (accessControlService.hasAction(AccessControlService_1.default.DATASOURCE_EDIT, actionSet.actions)) {
                    AddButtonService.registerAddButton("datasources", function () {
                        StateService.FeedManager().Datasource().navigateToDatasourceDetails(null);
                    });
                }
            });
            // Refresh list of data sources
            DatasourcesService.findAll()
                .then(function (datasources) {
                self.loading = false;
                self.datasources = datasources;
            });
        }
        ;
        return DatasourcesListController;
    }());
    exports.DatasourcesListController = DatasourcesListController;
    angular.module(moduleName).controller("DatasourcesListController", ["$scope", "AccessControlService", "AddButtonService", "DatasourcesService", "PaginationDataService", "StateService",
        "TableOptionsService", DatasourcesListController]);
});
//# sourceMappingURL=DatasourcesListController.js.map