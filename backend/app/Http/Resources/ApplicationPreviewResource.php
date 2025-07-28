<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Models\ApplicationForm;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationPreviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $enrollment = $this->enrollment;
        $student = $enrollment->student;
        $registrationNumber = ApplicationForm::where('application_id', '<=', $this->application_id)->count();
        $payment = $student->payments()->latest('payment_id')->first();
        return [
            'application_id' => $this->application_id,
            'registration_number' => $registrationNumber,
            'submitted_at' => $this->submitted_at,
            'student' => [
                'student_id' => $student->student_id,
                'student_status' => $student->student_status,
                'registration_id' => $student->registration_id,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'nickname' => $student->nickname,
                'citizenship' => $student->citizenship,
                'religion' => $student->religion,
                'place_of_birth' => $student->place_of_birth,
                'date_of_birth' => $student->date_of_birth,
                'email' => $student->email,
                'phone_number' => $student->phone_number,
                'previous_school' => $student->previous_school,
                'academic_status' => $student->academic_status,
                'gender' => $student->gender,
                'family_rank' => $student->family_rank,
                'age' => $student->age,
            ],
            'address' => optional($student->studentAddress)->only([
                'street',
                'village',
                'district',
                'rt',
                'rw',
                'city_regency',
                'province',
                'other',
            ]),
            'enrollment' => [
                'class' => $enrollment->schoolClass->grade,
                'section_id' => $enrollment->schoolClass->section_id,
                'section_name' => $enrollment->schoolClass->section->name,
                'major_id' => $enrollment->schoolClass->major_id,
                'major_name' => $enrollment->schoolClass->major->name,
                'program_id' => $enrollment->program_id,
                'program_name' => $enrollment->program->name,
                'residence' => $enrollment->residenceHall->type,
                'transportation' => $enrollment->transportation->type,
                'policies' => [
                    'residence_hall' => $enrollment->residence_hall_policy,
                    'transportation' => $enrollment->transportation_policy,
                ],
            ],
            'parent' => [
                'father' => [
                    'name' => $student->studentParent->father_name ?? null,
                    'occupation' => $student->studentParent->father_occupation ?? null,
                    'company' => $student->studentParent->father_company ?? null,
                    'phone' => $student->studentParent->father_phone ?? null,
                    'email' => $student->studentParent->father_email ?? null,
                    'address' => optional($student->studentParent->fatherAddress)->only([
                        'street', 'rt', 'rw', 'village', 'district', 'city_regency', 'province', 'other'
                    ]),
                ],
                'mother' => [
                    'name' => $student->studentParent->mother_name ?? null,
                    'occupation' => $student->studentParent->mother_occupation ?? null,
                    'company' => $student->studentParent->mother_company ?? null,
                    'phone' => $student->studentParent->mother_phone ?? null,
                    'email' => $student->studentParent->mother_email ?? null,
                    'address' => optional($student->studentParent->motherAddress)->only([
                        'street', 'rt', 'rw', 'village', 'district', 'city_regency', 'province', 'other'
                    ]),
                ]
            ],
            'guardian' => [
                'name' => optional(optional($student->studentGuardian)->guardian)->guardian_name,
                'relation_to_student' => optional(optional($student->studentGuardian)->guardian)->relation_to_student,
                'phone' => optional(optional($student->studentGuardian)->guardian)->phone_number,
                'email' => optional(optional($student->studentGuardian)->guardian)->guardian_email,
                'address' => optional(optional(optional($student->studentGuardian)->guardian)->guardianAddress)->only([
                    'street', 'rt', 'rw', 'village', 'district', 'city_regency', 'province', 'other'
                ]),
            ],
            'payment' => [
                'type' => $payment ? $payment->type : null,
                'method' => $payment ? $payment->method : null,
                'financial_policy' => $payment ? $payment->financial_policy_contract : null,
            ],
            'discount' => $enrollment->studentDiscount->map(function ($discount) {
                return [
                    'type' => optional($discount->discountType)->name,
                    'notes' => $discount->notes
                ];
            })->values()
        ];
    }
}
