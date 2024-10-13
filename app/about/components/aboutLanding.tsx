'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutLanding() {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mx-auto mt-52 flex max-w-screen-2xl justify-center px-8 py-20"
      >
        <div className="text-center">
          <motion.h2 variants={slideUp} className="mb-12 text-4xl font-extrabold">
            About The Finance Desk
          </motion.h2>
          <motion.p variants={slideUp} className="mb-8 text-lg">
            At The Finance Desk, we are dedicated to empowering start-ups and small businesses in
            South Africa by making business registration and compliance as seamless and
            straightforward as possible. Our mission is to transform business ideas into realities,
            helping entrepreneurs navigate the often-complex financial landscape with ease and
            confidence.
          </motion.p>
          <motion.div
            variants={slideUp}
            className="relative mx-auto h-64 w-full max-w-2xl overflow-hidden rounded-lg"
          >
            <Image
              src="/placeholder.svg?height=256&width=512"
              alt="Finance Desk Team"
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mx-auto mt-52 flex max-w-screen-2xl justify-center px-8 py-20"
      >
        <div className="text-center">
          <motion.h2 variants={slideUp} className="mb-12 text-4xl font-extrabold">
            Our Vision
          </motion.h2>
          <motion.p variants={slideUp} className="mb-8 text-lg">
            Our vision is to provide a personalized service that makes our clients feel at ease,
            knowing their business is compliant and supported by comprehensive financial services.
            We are committed to seeing businesses grow and thrive, offering a personalized touch to
            ensure that every entrepreneur feels supported through all seasons of their business
            journey.
          </motion.p>
          <motion.div
            variants={slideUp}
            className="relative mx-auto h-64 w-full max-w-2xl overflow-hidden rounded-lg"
          >
            <Image
              src="/placeholder.svg?height=256&width=512"
              alt="Finance Vision"
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto mt-52 flex max-w-screen-2xl justify-center px-8 py-20"
      >
        <div className="px-4 py-8">
          <motion.div variants={fadeIn} className="max-w-xl">
            <h2 className="text-3xl font-bold">What makes us special</h2>
            <p className="mt-4">
              The Finance Desk, tailored to succinctly outline the core services and value
              proposition of the company:
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-8 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 md:gap-12 lg:grid-cols-3"
          >
            {[
              {
                title: 'Company Registration and Compliance',
                description:
                  'We make the process of company registration and compliance straightforward and hassle-free. Our online portal allows for quick setup, ensuring that your business meets all legal requirements without the red tape typically associated with these processes.',
              },
              {
                title: 'Financial Consulting and Strategy',
                description:
                  "Our team of experienced financial consultants offers personalized advice and strategies tailored to your business goals. Whether it's financial planning, budgeting, or investment strategies, we provide the insights you need to make informed decisions and drive business growth.",
              },
              {
                title: 'AI-Powered Solutions',
                description:
                  'Leveraging the latest in AI technology, The Finance Desk offers advanced tools and solutions that enhance operational efficiency. From automating accounting processes to providing predictive analytics for financial forecasting, our AI-driven tools are designed to optimize your business processes.',
              },
              {
                title: 'Tailored Integration Services',
                description:
                  'We specialize in seamlessly integrating advanced AI tools with your existing business systems. This approach ensures that you benefit from the latest technological advancements without disrupting your current operations.',
              },
              {
                title: 'Ongoing Support and Training',
                description:
                  'Our commitment to your success extends beyond initial setup. We provide ongoing support and training to ensure that you are getting the most out of our services. Our team is always on hand to help you navigate any challenges and to ensure continuous improvement in your financial operations.',
              },
              {
                title: 'Empowering Entrepreneurs',
                description:
                  'At the core of our mission is a commitment to empower entrepreneurs. We strive to provide tools and services that not only meet your current needs but also scale with your business as it grows. We are here to support you every step of the way, from inception to expansion.',
              },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeIn} className="flex items-start gap-4">
                <span className="shrink-0 rounded-lg bg-primary p-4 text-white">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    ></path>
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-bold">{item.title}</h2>
                  <p className="mt-1 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2 variants={slideUp} className="text-3xl font-bold sm:text-4xl">
            Trusted by Businesses Countrywide
          </motion.h2>
          <motion.p variants={slideUp} className="mt-4 sm:text-xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione dolores laborum labore
            provident impedit esse recusandae facere libero harum sequi.
          </motion.p>
        </div>

        <motion.dl
          variants={stagger}
          className="mg-6 mt-8 grid grid-cols-1 gap-4 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"
        >
          {[
            { title: 'Client Satisfaction', value: '25+' },
            { title: 'Expert Support Team', value: '48h' },
            { title: 'Sales Count', value: '1098+' },
            { title: 'Clients Countrywide', value: '82+' },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="flex flex-col px-4 py-8 text-center"
            >
              <dt className="order-last text-lg font-medium">{item.title}</dt>
              <dd className="text-4xl font-extrabold text-primary md:text-5xl">{item.value}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto grid max-w-screen-2xl grid-cols-1 justify-center gap-5 px-8 py-2 md:grid-cols-2"
      >
        {[
          {
            title: 'Our Approach',
            description:
              'We take a holistic approach to business solutions, combining state-of-the-art technology with a personal touch. Through our online portal, thefinancedesk.co.za, we provide a spectrum of services tailored to meet the unique needs of each client. From effortless company registrations to comprehensive tax and compliance services, we ensure that all your business needs are efficiently covered.',
          },
          {
            title: 'Why Choose Us?',
            description:
              'We exist to break through the price barriers that small and new businesses often face. By creating an inclusive, efficient, and accessible service, we aim to empower businesses at every stage of their journey. Our team of experts, consultants, and advisors provides smart solutions at the click of a button, eliminating the need for excessive meetings and cutting through red tape.',
          },
          {
            title: 'Excellence',
            description:
              "Be part of a community of innovators who are setting new standards in the financial industry. With The Finance Desk, you're not just starting a business; you're setting it up for success.",
          },
          {
            title: 'Some Interesting Podcast Title',
            description:
              "Let's Build Your Business Together. At The Finance Desk, we don't just manage finances — we build futures.",
          },
        ].map((item, index) => (
          <motion.div key={index} variants={fadeIn}>
            <Card className="rounded-xl border border-primary p-4 sm:p-6 lg:p-8">
              <CardHeader>
                <CardTitle className="mt-4 text-lg font-medium sm:text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mt-1 text-sm">{item.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>
    </>
  );
}
