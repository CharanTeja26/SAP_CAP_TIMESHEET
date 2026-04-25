using timesheet as db from '../db/schema';


service TimesheetService @(requires: 'authenticated-user') {
  function me() returns {
    isManager : Boolean;
  };

  @odata.draft.enabled

  entity Activities       as projection on db.Activities;

  annotate TimesheetService.Activities with @(restrict: [
    {
        grant: '*',
        to   : 'Employee',
        where: 'createdBy = $user'
    }, {
        grant: '*',
        to   : 'Manager'
    }
]);

  @(requires: 'Manager')
  entity DescriptionQV    as projection on db.DescriptionQV;

  entity CompaniesVH      as
    projection on db.Companies {
      companyCode,
      companyName
    }

  entity ActivityStatus   as projection on db.ActivityStatus;
  entity Modules          as projection on db.Modules;
  entity EmployeesDetail  as projection on db.Employees;

   entity Holidays  as projection on db.Holidays;

  type inText : {
    comment : String;
  };

      @(requires: 'Manager')
  entity ApproverWorkList as projection on db.ApproverWorkList
    actions {

      @Common.SideEffects     : {TargetEntities: ['']}
      @Core.OperationAvailable: {$edmJson: {$Ne: [
        {$Path: 'in/status_code'},
        'A'
      ]}}
      action Approve()                    returns Activities;

      @Common.SideEffects     : {TargetEntities: ['']}
      @Core.OperationAvailable: {$edmJson: {$Ne: [
        {$Path: 'in/status_code'},
        'A'
      ]}}
      action Reject(text: inText:comment) returns ApproverWorkList;

    };

    entity TimesheetAnalytics as
    select from Activities
    {
        key pers.ID           as employeeID,
            pers.fullName     as employeeName,
            // company.companyName as companyName,
            // Module.name       as moduleName,
            // status.code       as status,
            // count(ActNo)      as totalEntries : String,
            sum(hours)        as totalHours : Decimal(10, 2)
    }
    group by
        pers.ID,
        pers.fullName;
        // company.companyName,
        // Module.name,
        // status.code;

    entity TimesheetMonthlyAnalytics as
    select from Activities
    {
        key month(workDate)   as month : Integer,
        key year(workDate)    as year : Integer,
            sum(hours)        as totalHours : Decimal(10, 2)
    }
    group by
        month(workDate),
        year(workDate);

    entity TimesheetStatusAnalytics as
    select from Activities
    {
        key status.name as status,
            count(*)    as totalCount : Integer
    }
    group by status.name;
}
