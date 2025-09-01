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
                'country' => $student->country,
                'religion' => $student->religion,
                'place_of_birth' => $student->place_of_birth,
                'date_of_birth' => $student->date_of_birth,
                'email' => $student->email,
                'phone_number' => $student->phone_number,
                'previous_school' => $student->previous_school,
                'academic_status' => $student->academic_status,
                'academic_status_other' => $student->academic_status_other,
                'gender' => $student->gender,
                'family_rank' => $student->family_rank,
                'age' => $student->age,
                'nisn' =>$student->nisn,
                'nik' =>$student->nik,
                'kitas' =>$student->kitas,
                'registration_date' => $student->registration_date,
                'street' => $student->studentAddress->street,
                'village' => $student->studentAddress->village,
                'district'=> $student->studentAddress->district,
                'rt'=> $student->studentAddress->rt,
                'rw'=> $student->studentAddress->rw,
                'city_regency'=> $student->studentAddress->city_regency,
                'province'=> $student->studentAddress->province,
                'other'=> $student->studentAddress->other,
            ],
            'enrollment' => [
                'school_year' => $this->enrollment->schoolYear ? [
                    'year' => $this->enrollment->schoolYear->year
                ] : null,
                'semester' => $this->enrollment->semester ? [
                    'number' => $this->enrollment->semester->number
                ] : null,
                'class' => $enrollment->schoolClass->grade,
                'section' => $this->enrollment->section ? [
                    'id' => $this->enrollment->section->section_id,
                    'name' => $this->enrollment->section->name
                ] : null,
                'major' => $this->enrollment->major ? [
                    'id' => $this->enrollment->major->major_id,
                    'name' => $this->enrollment->major->name
                ] : null,
                'program' => $this->enrollment->program ? [
                    'id' => $this->enrollment->program_id,
                    'name' => $this->enrollment->program->name
                ] : null,
                'residence' => $this->enrollment->residenceHall ? [
                    'id' => $this->enrollment->residenceHall->residence_id,
                    'name' => $this->enrollment->residenceHall->type,
                    'policy' => $this->enrollment->residence_hall_policy ?? 'Not Signed'
                ] : null,
                'transportation' => $this->enrollment->transportation ? [
                    'id' => $this->enrollment->transportation->transport_id,
                    'name' => $this->enrollment->transportation->type,
                    'policy' => $this->enrollment->transportation_policy ?? 'Not Signed'
                ] : null,
                'pickup_point' => $this->enrollment->pickupPoint ? [
                    'id' => $this->enrollment->pickupPoint->pickup_point_id,
                    'name' => $this->enrollment->pickupPoint->name,
                ] : null,
            ],
            'father' => [
                'name' => $student->studentParent->father_name ?? null,
                'occupation' => $student->studentParent->father_occupation ?? null,
                'company' => $student->studentParent->father_company ?? null,
                'phone' => $student->studentParent->father_phone ?? null,
                'email' => $student->studentParent->father_email ?? null,
                'company_addresses' => $student->studentParent->father_company_addresses ?? null,
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
                'company_addresses' => $student->studentParent->mother_company_addresses ?? null,
                'address' => optional($student->studentParent->motherAddress)->only([
                    'street', 'rt', 'rw', 'village', 'district', 'city_regency', 'province', 'other'
                ]),
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
                'tuition_fees' => $payment ? $payment->tuition_fees : null,
                'residence_payment' => $payment ? $payment->residence_payment : null,
                'financial_policy' => $payment ? $payment->financial_policy_contract : null,
            ],
            'discount' => $enrollment->studentDiscount? [
                'type' => optional($enrollment->studentDiscount->discountType)->name,
                'notes' => $enrollment->studentDiscount->notes,
            ] : null,
        ];
    }
}