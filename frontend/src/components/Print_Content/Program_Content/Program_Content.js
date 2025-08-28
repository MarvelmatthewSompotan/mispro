import React, { useMemo } from 'react';
import styles from '../../styles/Program_Content.module.css';

function ProgramContent({ programData }) {
  const data = programData || {};

  // Normalisasi Section: dukung id (1-4) dan nama section
  const selectedSection = useMemo(() => {
    const rawId = data.section_id ?? data.sectionId ?? data.section;
    const sectionId = rawId != null && !Number.isNaN(Number(rawId)) ? Number(rawId) : null;

    if (sectionId === 1) return 'ecp';
    if (sectionId === 2) return 'elementary';
    if (sectionId === 3) return 'middle';
    if (sectionId === 4) return 'high';

    const rawName = (data.section_name ?? data.section ?? '').toString().toLowerCase();
    if (rawName.includes('ecp')) return 'ecp';
    if (rawName.includes('elementary')) return 'elementary';
    if (rawName.includes('middle')) return 'middle';
    if (rawName.includes('high')) return 'high';

    return '';
  }, [data.section, data.section_id, data.sectionId, data.section_name]);

  // Normalisasi Program:
  // - Prioritas array "programs" dari preview: [{id, name, selected}]
  // - Fallback: single "program_id"
  // - Dukung string CSV atau array id
  const selectedPrograms = useMemo(() => {
    // 1) Prioritas: array programs dari preview
    if (Array.isArray(data.programs) && data.programs.length) {
      const map = { uan: false, abeka: false, oxford: false, cambridge: false, others: false };
      data.programs.forEach((p) => {
        if (!p) return;
        if (p.id === 1) map.uan = !!p.selected;
        if (p.id === 2) map.abeka = !!p.selected;
        if (p.id === 3) map.oxford = !!p.selected;
        if (p.id === 4) map.cambridge = !!p.selected;
        if (p.id === 5) map.others = !!p.selected;
      });
      // Jika ada program_other teks, anggap Others dipilih
      if (data.program_other && String(data.program_other).trim() !== '') {
        map.others = true;
      }
      return map;
    }

    // 2) Fallback: gunakan "program_id" single atau bentuk lain
    const raw = data.program_id ?? data.program_ids ?? data.programId ?? data.programs;
    let ids = [];

    if (Array.isArray(raw)) {
      if (raw.length > 0 && typeof raw[0] === 'object') {
        ids = raw
          .filter((p) => p && (p.selected === true || p.selected === 1 || p.selected === '1'))
          .map((p) => Number(p.id))
          .filter((v) => !Number.isNaN(v));
      } else {
        ids = raw.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
      }
    } else if (typeof raw === 'string') {
      ids = raw.split(',').map((v) => Number(v.trim())).filter((v) => !Number.isNaN(v));
    } else if (raw != null) {
      const n = Number(raw);
      if (!Number.isNaN(n)) ids = [n];
    }

    const idSet = new Set(ids);
    return {
      uan: idSet.has(1),
      abeka: idSet.has(2),
      oxford: idSet.has(3),
      cambridge: idSet.has(4),
      others: idSet.has(5) || (!!data.program_other && String(data.program_other).trim() !== '')
    };
  }, [data.program_id, data.program_ids, data.programId, data.programs, data.program_other]);

  // Grade & Major: gunakan label dari preview/form jika tersedia
  const gradeValue = useMemo(() => {
    // preview mengirim "grade" sebagai string class seperti '9'
    // fallback ke class_id jika memang yang tersedia
    return (data.grade ?? data.class ?? data.class_id ?? 'N/A');
  }, [data.grade, data.class, data.class_id]);

  const majorLabel = useMemo(() => {
    // preview mengirim "major" atau "major_name" (mis: 'SCIENCE'/'SOCIAL')
    // fallback ke major_id jika label tidak tersedia
    return (data.major ?? data.major.id ?? data.major.name ?? 'N/A');
  }, [data.major, data.major.id, data.major.name]);

  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Section</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.radioBtn} ${selectedSection === 'ecp' ? styles.selected : ''}`}>
            <div className={styles.radioBtnChild} />
            {selectedSection === 'ecp' && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.elementarySchool}>ECP</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.radioBtn} ${selectedSection === 'elementary' ? styles.selected : ''}`}>
            <div className={styles.radioBtnChild} />
            {selectedSection === 'elementary' && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.elementarySchool}>Elementary School</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.radioBtn} ${selectedSection === 'middle' ? styles.selected : ''}`}>
            <div className={styles.radioBtnChild} />
            {selectedSection === 'middle' && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.elementarySchool}>Middle School</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.radioBtn} ${selectedSection === 'high' ? styles.selected : ''}`}>
            <div className={styles.radioBtnChild} />
            {selectedSection === 'high' && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.elementarySchool}>High School</div>
        </div>

        <div className={styles.grade}>
          <div className={styles.elementarySchool}>Grade</div>
          <b className={styles.elementarySchool}>{gradeValue}</b>
        </div>

        <div className={styles.major}>
          <div className={styles.elementarySchool}>Major</div>
          <b className={styles.science}>{majorLabel}</b>
        </div>
      </div>

      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Program</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.checkBox} ${selectedPrograms.uan ? styles.selected : ''}`}>
            <div className={styles.checkBoxChild} />
            {selectedPrograms.uan && <div className={styles.checkBoxInner} />}
          </div>
          <div className={styles.elementarySchool}>UAN</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.checkBox} ${selectedPrograms.abeka ? styles.selected : ''}`}>
            <div className={styles.checkBoxChild} />
            {selectedPrograms.abeka && <div className={styles.checkBoxInner} />}
          </div>
          <div className={styles.elementarySchool}>A Beka</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.checkBox} ${selectedPrograms.oxford ? styles.selected : ''}`}>
            <div className={styles.checkBoxChild} />
            {selectedPrograms.oxford && <div className={styles.checkBoxInner} />}
          </div>
          <div className={styles.elementarySchool}>Oxford</div>
        </div>

        <div className={styles.ecp}>
          <div className={`${styles.checkBox} ${selectedPrograms.cambridge ? styles.selected : ''}`}>
            <div className={styles.checkBoxChild} />
            {selectedPrograms.cambridge && <div className={styles.checkBoxInner} />}
          </div>
          <div className={styles.elementarySchool}>Cambridge</div>
        </div>

        <div className={styles.other}>
          <div className={`${styles.checkBox} ${selectedPrograms.others ? styles.selected : ''}`}>
            <div className={styles.checkBoxChild} />
            {selectedPrograms.others && <div className={styles.checkBoxInner} />}
          </div>
          <div className={styles.elementarySchool}>
            Others: {selectedPrograms.others ? (data.program_other || '') : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgramContent;