# Task: Governance & Role Management ✅

## 1. Database Updates ✅
- [x] Create migration for `is_deletion_requested` and `deleted_at` (SoftDeletes) on `templates`
- [x] Update `Template.php` model with `SoftDeletes` and fillable array.

## 2. Role Management UI ✅
- [x] Update `Admin/UserController.php` to pass available roles to the view.
- [x] Update `Admin/Users/Index.jsx` to include a Role Assignment dropdown/button.

## 3. Super Admin Bypass ✅
- [x] Update `TemplateController@publish` to auto-approve templates if user `hasRole('admin')`.

## 4. Creator Deletion workflow ✅
- [x] Add `requestDeletion` method to `TemplateController`.
- [x] Update `Creator/Dashboard.jsx` to show "Request Deletion" button and "Pending Deletion" badge.

## 5. Admin Moderation UI ✅
- [x] Update `Admin/TemplateController@moderationIndex` to fetch deletion requests.
- [x] Update `Admin/Templates/Moderation.jsx` to include the Deletion Requests section.
- [x] Add `approveDeletion` method to securely soft delete the template.

**PROJECT COMPLETE.**
