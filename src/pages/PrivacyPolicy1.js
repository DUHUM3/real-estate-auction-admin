import React, { useState, useRef, useEffect } from 'react';

const TermsAndPrivacy = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const [activeSection, setActiveSection] = useState('');
  const termsRef = useRef(null);
  const privacyRef = useRef(null);

  // بيانات شروط الاستخدام
  const termsData = [
    { id: 'introduction', title: 'المقدمة', content: 'تحكم شروط الاستخدام هذه ("الشروط") وصولك واستخدامك للموقع الإلكتروني www.shaheenplus.com وتطبيقاته على iOS وANDROID وكافة الصفحات والخدمات المتاحة من خلالها.' },
    { id: 'definitions', title: 'التعريفات', content: 'في هذه الشروط، وما لم يقتض السياق خلاف ذلك يكون للمصطلحات التالية المعاني المشار إليها...' },
    { id: 'eligibility', title: 'الأهلية القانونية والحساب', content: 'من أجل استخدام موقع وتطبيق "شاهين بلس"، يجب على المستخدم تسجيل حساب، وأن يوافق على الشروط المذكورة...' },
    { id: 'confirmations', title: 'التأكيدات والضمانات', content: 'بمجرد تسجيل حساب في موقع وتطبيق "شاهين بلس" وفقاً لأحكام التسجيل، فأنت تنفيذ بها بي...' },
    { id: 'services', title: 'النطاق القانوني للخدمات', content: '"شاهين بلس" موقع إلكتروني وتطبيقات على جوجل بلاي وأبل ستور تملكها وتديرها مؤسسة غيمة جسار للتسويق الإلكتروني...' },
    { id: 'ads', title: 'سياسة الإعلانات', content: 'تضاف المنشورات من قبل المعلنين المسجلين في موقع وتطبيق "شاهين بلس"، ويمكن للعميل استخدام محرك البحث أعلى الصفحة...' },
    { id: 'fees', title: 'سياسة الرسوم والعمولة', content: 'الاشتراك والتسجيل في موقع وتطبيق "شاهين بلس" بدون رسوم، ويحق لنا فرض رسوم مستقبلاً إذا رأينا ضرورة لذلك.' },
    { id: 'payment', title: 'سياسة الدفع', content: 'يوفر موقع وتطبيق "شاهين بلس" الدفع من خلال فيزا، وأبل باي، والتحويل البنكي.' },
    { id: 'licenses', title: 'التراخيص والقيود', content: 'مع مراعاة امتثالك لهذه الشروط، تمنحك مؤسسة شاهين بلس ترخيصاً محدوداً وغير حصري وغير قابل للتحويل...' },
    { id: 'disclaimer', title: 'سقوط المسؤولية', content: 'يتم توفير موقع وتطبيق "شاهين بلس" ومحتواه وخدماته والمعلومات المرتبطة به على أساس ثابت "كما هو" و"كما هو متاح"...' },
    { id: 'intellectual', title: 'الملكية الفكرية', content: 'تحتفظ مؤسسة شاهين بلس بجميع الحقوق والملكية والمصلحة في الموقع الإلكتروني وتطبيقاته والأجهزة والبرامج...' },
    { id: 'compensation', title: 'التعويضات', content: 'أنت توافق على تعويض مؤسسة شاهين بلس وأي من مسؤوليها وموظفيها ووكلائها عن أي خسائر، أو أضرار، أو مطالبات...' },
    { id: 'external', title: 'روابط الجهات الخارجية', content: 'قد يحتوي موقع وتطبيق "شاهين بلس" على روابط لمواقع أخرى تديرها أطراف أخرى غير مؤسسة شاهين بلس.' },
    { id: 'communications', title: 'الاتصالات الإلكترونية', content: 'قد نتواصل مع المستخدم عن طريق البريد الإلكتروني المسجل في الموقع والتطبيق فيما يتعلق بالتغيريات والتحديثات...' },
    { id: 'duration', title: 'المدة والإنهاء', content: 'تكون مدة هذه الشروط محددة بمدة تسجيلك واستخدامك للحساب، وتظل سارية ونافذة أثناء استخدامك للموقع والتطبيق...' },
    { id: 'modifications', title: 'التعديلات في الشروط', content: 'يحق لمؤسسة شاهين بلس تعديل، أو تحديث، أو إكمال، أو استبدال، أو حذف أي شرط من هذه الشروط الحالية...' },
    { id: 'jurisdiction', title: 'الاختصاص القضائي', content: 'تخضع وتفسر هذه الشروط وفقاً للقوانين السارية في المملكة العربية السعودية.' },
    { id: 'rights', title: 'تحويل الحقوق والالتزامات', content: 'يحق لمؤسسة شاهين بلس تحويل أو نقل كافة حقوقها أو التزاماتها المنصوص عليها في هذه الشروط إلى أي طرف ثالث...' },
    { id: 'other', title: 'أحكام أخرى', content: 'القوة القاهرة: لن تتحمل مؤسسة شاهين بلس مسئولية أي تأخير أو إخفاق في أداء أي من التزاماتها بموجب هذه الشروط...' },
    { id: 'language', title: 'اللغة', content: 'كتبت هذه الشروط باللغة العربية، وفي حال ترجمتها إلى اللغة الإنجليزية أو أي لغة أجنبية أخرى، فإن النص العربي سيكون هو السائد...' },
    { id: 'agreement', title: 'الاتفاق الكامل', content: 'تشكل هذه الشروط وسياسة الخصوصية وأي سياسات أو قواعد تشغيل لموقع وتطبيق "شاهين بلس" كل بنود الاتفاق الكامل...' },
    { id: 'contact', title: 'التواصل معنا', content: 'إذا كان لديك أي أسئلة بشأن هذه الشروط، أو الممارسات المتعلقة بموقع وتطبيق "شاهين بلس"، فلا تردد في التواصل معنا...' },
  ];

  // بيانات سياسة الخصوصية
  const privacyData = [
    { id: 'privacy-intro', title: 'المقدمة', content: 'تشكل سياسة الخصوصية هذه عقداً قانونياً ملزماً وقابل للتنفيذ بين مؤسسة شاهين بلس وبينك ("المستخدم").' },
    { id: 'privacy-consent', title: 'الموافقة على السياسة', content: 'بوصولك أو استخدامك لخدمات موقع وتطبيق "شاهين بلس"، فأنت تقر بأنك قرأت هذه السياسة وشروط الاستخدام وتوافق صراحة على الالتزام بجميع البنود الواردة فيها.' },
    { id: 'privacy-scope', title: 'نطاق السياسة', content: 'تنطبق سياسة الخصوصية هذه على كل من يزور أو يتصفح أو يستخدم موقع وتطبيق "شاهين بلس" بما في ذلك المعلومات والبيانات والخدمات والآدوات وجميع الصفحات والأنشطة الأخرى.' },
    { id: 'privacy-principles', title: 'المبادئ العامة للخصوصية', content: 'وضعت مؤسسة شاهين بلس مبادئ مهمة تتعلق بالبيانات الشخصية للمستخدمين، وهي...' },
    { id: 'privacy-collection', title: 'طرق جمع البيانات', content: 'يجمع موقع وتطبيق "شاهين بلس" البيانات الشخصية بطرق مختلفة على النحو التالي: التفاعلات المباشرة، التفاعلات الآلية، الأطراف الثالثة.' },
    { id: 'privacy-usage', title: 'أغراض استخدام البيانات', content: 'يستخدم موقع وتطبيق "شاهين بلس" البيانات التي يجمعها للأغراض التالية: مساعدة المستخدمين في إنشاء الحساب، تعزيز أعمالنا، تزويد المستخدمين بالدعم الفني...' },
    { id: 'privacy-sharing', title: 'مشاركة البيانات', content: 'نشارك البيانات الشخصية التي تجمعها وفقاً لهذه السياسة مع الشركات التابعة لنا ومع الأطراف الثالثة الأخرى التي قد تكون ضرورية لتحقيق الأغراض المنصوص عليها.' },
    { id: 'privacy-retention', title: 'تعزيز البيانات والاحتفاظ بها', content: 'يعزز موقع وتطبيق "شاهين بلس" البيانات الشخصية للمستخدمين طالما كانت ضرورية لتحقيق الأغراض المحددة.' },
    { id: 'privacy-security', title: 'الإجراءات الأمنية لحماية البيانات', content: 'نتخذ كافة التدابير الأمنية اللازمة والمتوسطة لحماية البيانات الشخصية التي يقدمها المستخدم على موقع وتطبيق "شاهين بلس" من الفقد أو التلف...' },
    { id: 'privacy-login', title: 'حمامة بيانات الدخول للحساب', content: 'بيانات الدخول للحساب هي مسئولية شخصية للمستخدم، وفي حال حصول شخص آخر على تلك البيانات بأي وسيلة واستخدامها للدخول إلى الموقع أو التطبيق...' },
    { id: 'privacy-changes', title: 'تغييرات في بيانات الحساب', content: 'من المهم أن تكون البيانات الشخصية للمستخدم دقيقة ومحدثة، يرجى إيقاننا على اطلاع بأي تغييرات تطرأ على بياناتك الشخصية خلال فترة تعاملك معنا.' },
    { id: 'privacy-links', title: 'الروابط الخارجية', content: 'قد يحتوي موقع وتطبيق "شاهين بلس" على روابط تحيل المستخدم أو الزائر إلى تطبيقات أو روابط أو مواقع الكترونية خارجية...' },
    { id: 'privacy-responsibilities', title: 'مسؤوليات المستخدم', content: 'يتعهد المستخدم بتقديم بيانات كاملة وصحيحة ودقيقة، والالتزام بالحفاظ على سرية بيانات الحساب.' },
    { id: 'privacy-cookies', title: 'ملفات تعريف الارتباط (الكوكيز)', content: 'يستخدم موقع وتطبيق "شاهين بلس" خاصية الكوكيز للمعلومات الأساسية مثل تصفح الموقع أو التطبيق، وتقديم الإعلانات التي تناسب اهتمامات المستخدمين...' },
    { id: 'privacy-modifications', title: 'التعديلات في سياسة الخصوصية', content: 'تمتلك مؤسسة شاهين بلس الحق الكامل في إجراء تعديلات على سياسة الخصوصية هذه في أي وقت لتتضمن الممارسات السائدة في موقع وتطبيق "شاهين بلس"...' },
    { id: 'privacy-approval', title: 'الموافقة على سياسة الخصوصية', content: 'يقدر المستخدم بأنه قرأ سياسة الخصوصية هذه، ويوافق على الالتزام بجميع بنودها وشروطها.' },
    { id: 'privacy-questions', title: 'الأسئلة والتعليقات', content: 'إذا كانت لديك أية أسئلة أو استفسارات حول سياسة الخصوصية هذه، يرجى التواصل معنا على: info@shaheenplus.com' },
  ];

  // روابط ملفات PDF - ضع ملفاتك في مجلد public
  const pdfFiles = {
    terms: '/pdf/p.pdf', // ضع ملف PDF في public/pdf/terms-and-conditions.pdf
    privacy: '/pdf/x.pdf' // ضع ملف PDF في public/pdf/privacy-policy.pdf
  };

  // تحديد البيانات النشطة بناءً على التبويب المختار
  const activeData = activeTab === 'terms' ? termsData : privacyData;

  // تأثير للتمرير إلى القسم النشط
  useEffect(() => {
    const element = document.getElementById(activeSection);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSection]);

  // دالة لتحميل الملف
  const handleDownload = () => {
    const fileUrl = activeTab === 'terms' ? pdfFiles.terms : pdfFiles.privacy;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = activeTab === 'terms' ? 'شروط-الاستخدام-شاهين-بلس.pdf' : 'سياسة-الخصوصية-شاهين-بلس.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            شاهين <span className="text-blue-600">بـلـس</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {/* يمكنك إضافة وصف هنا إذا أردت */}
          </p>
        </header>

        {/* زر التحميل - يظهر في الأعلى */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {activeTab === 'terms' ? 'تحميل شروط الاستخدام' : 'تحميل سياسة الخصوصية'}
          </button>
        </div>

        {/* التبويبات الرئيسية */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 flex">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              شروط الاستخدام
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              سياسة الخصوصية
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* القائمة الجانبية */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                {activeTab === 'terms' ? 'فهرس الشروط' : 'فهرس السياسة'}
              </h2>
              <nav className="space-y-2">
                {activeData.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`block w-full text-right py-2 px-4 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* رأس المحتوى */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      {activeTab === 'terms' ? 'شروط الاستخدام' : 'سياسة الخصوصية'}
                    </h2>
                    <p className="text-blue-100">
                      تاريخ السريان: {activeTab === 'terms' ? '١ نوفمبر ٢٠٢٠' : '٢٠٢٥'}
                    </p>
                  </div>
                  {/* زر التحميل في الهيدر */}
                  <button
                    onClick={handleDownload}
                    className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    تحميل PDF
                  </button>
                </div>
              </div>

              {/* محتوى الشروط/السياسة */}
              <div className="p-6 max-h-screen overflow-y-auto">
                {activeData.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="mb-10 scroll-mt-24"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                      {section.title}
                    </h3>
                    <div className="text-gray-700 leading-relaxed text-justify">
                      <p>{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* تذييل المحتوى */}
              <div className="bg-gray-50 p-6 border-t">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="text-gray-600 text-sm">
                      حقوق الطبع والنشر © {activeTab === 'terms' ? 'شاهين بلس 2020' : 'شاهين بلس 2025'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      جميع الحقوق محفوظة لمؤسسة شاهين بلس
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-gray-600 text-sm mb-2">
                      للاستفسارات، يرجى التواصل معنا على:
                    </p>
                    <a
                      href="mailto:info@shaheenplus.com"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      info@shaheenplus.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;