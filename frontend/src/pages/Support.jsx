import React, { useEffect, useRef, useState } from "react";

const DRAFT_KEY = "tms_support_draft_v1";
const SUBJECT_LIMIT = 120;
const DESCRIPTION_LIMIT = 2000;
const COOLDOWN_AFTER_SUCCESS_MS = 3000;

export default function Support() {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    fileName: "",
    fileDataUrl: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const subjectRef = useRef(null);
  const descriptionRef = useRef(null);
  const fileInputRef = useRef(null);
  const liveRef = useRef(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Debounced autosave
  useEffect(() => {
    const toSave = {
      subject: form.subject,
      description: form.description,
      fileName: form.fileName,
      fileDataUrl: form.fileDataUrl,
    };

    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      } catch (e) {
        // ignore quota errors
      }
    }, 600);

    return () => clearTimeout(id);
  }, [form.subject, form.description, form.fileName, form.fileDataUrl]);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.subject.trim()) newErrors.subject = "Subject is required.";
    else if (form.subject.trim().length > SUBJECT_LIMIT)
      newErrors.subject = `Subject cannot exceed ${SUBJECT_LIMIT} characters.`;

    if (!form.description.trim()) newErrors.description = "Description is required.";
    else if (form.description.trim().length > DESCRIPTION_LIMIT)
      newErrors.description = `Description cannot exceed ${DESCRIPTION_LIMIT} characters.`;

    return newErrors;
  };

  // focus first invalid
  const focusFirstError = (errs) => {
    if (errs.subject) {
      subjectRef.current?.focus();
      return;
    }
    if (errs.description) {
      descriptionRef.current?.focus();
      return;
    }
  };

  // file choose handler
  const handleFile = (file) => {
    if (!file) {
      setForm((s) => ({ ...s, fileName: "", fileDataUrl: null }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Attachment too large (max 5 MB). Remove the file and try again.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((s) => ({ ...s, fileName: file.name, fileDataUrl: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "subject" && value.length > SUBJECT_LIMIT) return;
    if (name === "description" && value.length > DESCRIPTION_LIMIT) return;

    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  // file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  };

  // clear attached file
  const clearFile = () => {
    fileInputRef.current.value = "";
    setForm((s) => ({ ...s, fileName: "", fileDataUrl: null }));
  };

  // clear draft
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm({ subject: "", description: "", fileName: "", fileDataUrl: null });
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
    subjectRef.current?.focus();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // form submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (cooldownUntil && Date.now() < cooldownUntil) {
      setErrorMessage("Please wait a moment before submitting another request.");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage("Please fix the highlighted fields.");
      focusFirstError(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await new Promise((res) => setTimeout(res, 1200));

      setSuccessMessage("Your support request has been submitted. Our team will contact you shortly.");
      setForm({ subject: "", description: "", fileName: "", fileDataUrl: null });
      localStorage.removeItem(DRAFT_KEY);

      setCooldownUntil(Date.now() + COOLDOWN_AFTER_SUCCESS_MS);
      setTimeout(() => setCooldownUntil(0), COOLDOWN_AFTER_SUCCESS_MS);
      liveRef.current?.focus();
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong while submitting. Please try again.");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Accessible live region */}
      <div
        tabIndex={-1}
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {successMessage || errorMessage}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Support Center</h1>
        <p className="text-slate-500">
          Get help with your Transport Management System. Raise a ticket or contact us directly.
        </p>
      </div>

      {/* Important Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Quick Alerts</h3>
          <p className="text-sm text-slate-500">Click Report to prefill the form</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 1, title: 'Insurance Expiring', msg: 'Insurance for MH12 AB 1234 expires in 5 days', severity: 'high', time: '5m ago', icon: 'warning', color: 'orange' },
            { id: 2, title: 'Service Due', msg: 'Service due for MH01 TX 9876 in 3 days', severity: 'medium', time: '20m ago', icon: 'build', color: 'blue' },
            { id: 3, title: 'Payment Overdue', msg: 'Payment overdue for vendor SKY Fuel Station', severity: 'critical', time: '1h ago', icon: 'error', color: 'red' },
          ].map((it) => (
            <div key={it.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  it.color === 'orange' ? 'bg-orange-100' :
                  it.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <span className={`material-symbols-outlined text-[20px] ${
                    it.color === 'orange' ? 'text-orange-600' :
                    it.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {it.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-900">{it.title}</p>
                    <span className="text-xs text-slate-400">{it.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{it.msg}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((s) => ({
                    ...s,
                    subject: `${it.title} — ${it.msg}`,
                    description: `Automated report from feed: ${it.msg}\n\nPlease investigate and advise.`,
                  }));
                  setErrors({});
                  setSuccessMessage("");
                  setErrorMessage("");
                  subjectRef.current?.focus();
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                Report Issue
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div
          className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 flex items-start gap-3"
          role="status"
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="flex-1">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div
          className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3"
          role="alert"
        >
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <form
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Submit Support Ticket</h2>
            <p className="text-sm text-slate-500">Fill out the form below and we'll get back to you soon.</p>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              name="subject"
              ref={subjectRef}
              value={form.subject}
              onChange={handleChange}
              placeholder="Brief description of your issue"
              aria-invalid={errors.subject ? "true" : "false"}
              aria-describedby={errors.subject ? "subject-error" : "subject-help"}
              className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition ${
                errors.subject ? "border-red-500 bg-red-50" : ""
              }`}
              maxLength={SUBJECT_LIMIT}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.subject ? (
                <p id="subject-error" className="text-red-600 text-xs font-medium">{errors.subject}</p>
              ) : (
                <p id="subject-help" className="text-slate-500 text-xs">A short title for your issue</p>
              )}
              <p className="text-slate-400 text-xs">{form.subject.length}/{SUBJECT_LIMIT}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              ref={descriptionRef}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail. Include steps to reproduce, expected vs actual behavior, and any error messages."
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={errors.description ? "description-error" : "description-help"}
              className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition h-40 resize-y ${
                errors.description ? "border-red-500 bg-red-50" : ""
              }`}
              maxLength={DESCRIPTION_LIMIT}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.description ? (
                <p id="description-error" className="text-red-600 text-xs font-medium">{errors.description}</p>
              ) : (
                <p id="description-help" className="text-slate-500 text-xs">Provide as much detail as possible</p>
              )}
              <p className="text-slate-400 text-xs">{form.description.length}/{DESCRIPTION_LIMIT}</p>
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attachment <span className="text-slate-400 text-xs">(optional)</span>
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                  Choose File
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Attach file (image or pdf)"
                  />
                </label>
                {form.fileName && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-700">{form.fileName}</span>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Preview */}
              {form.fileDataUrl && form.fileName?.match(/\.(png|jpg|jpeg|gif|webp)$/i) && (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-w-xs">
                  <img src={form.fileDataUrl} alt="attachment preview" className="w-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Maximum file size: 5MB. Supported: Images, PDF</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || (cooldownUntil && Date.now() < cooldownUntil)}
              className="flex-1 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Submit Ticket
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearDraft}
              className="px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Contact Options Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">contact_support</span>
              Quick Contact
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:support@tms.com"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all group"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">mail</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <p className="text-xs text-slate-500">support@tms.com</p>
                </div>
              </a>

              <a
                href="https://wa.me/918888888888"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-green-200 transition-all group"
              >
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <span className="material-symbols-outlined text-green-600 text-[20px]">chat</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">WhatsApp</p>
                  <p className="text-xs text-slate-500">+91 88888 88888</p>
                </div>
              </a>

              <a
                href="tel:+918888888888"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all group"
              >
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">call</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Phone</p>
                  <p className="text-xs text-slate-500">+91 88888 88888</p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Response Time
            </h3>
            <p className="text-sm text-indigo-700">
              Our support team typically responds within <strong>2-4 hours</strong> during business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
