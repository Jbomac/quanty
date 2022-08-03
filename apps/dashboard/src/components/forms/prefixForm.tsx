import { joiResolver } from '@hookform/resolvers/joi'
import Joi from 'joi'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

import {
  useGuildConfigSubscription,
  useUpdateGuildByIdMutation,
} from '../../graphql/generated/schema'
import { useCurrentGuildId } from '../../hooks/useCurrentGuildId'
import { guildConfigAtom } from '../../utils/atoms'

const prefixSchema = Joi.object({
  prefix: Joi.string().required().min(1).max(5).messages({
    'string.min': 'Prefix cannot be empty.',
    'string.max': 'Prefix cannot exceed 5 characters.',
    'string.empty': 'Prefix is required.',
  }),
})

export const PrefixForm = ({ placeholder }: { placeholder?: string }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(prefixSchema),
  })

  const guildId = useCurrentGuildId()

  const guild = useAtomValue(guildConfigAtom)

  const [updatePrefix] = useUpdateGuildByIdMutation()

  useGuildConfigSubscription({
    variables: {
      guildId,
    },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      setValue('prefix', data?.updatedGuildConfig.prefix)
    },
  })

  useEffect(() => {
    setValue('prefix', guild ? guild.prefix : 'default: q!')
  }, [guildId])

  const onSubmit = (data: { prefix?: string }) => {
    toast.promise(
      updatePrefix({
        variables: {
          guildId: guildId as string,
          guildUpdateInput: {
            prefix: { set: data.prefix },
          },
        },
      }),
      {
        loading: 'Updating...',
        error: <b>Could not update prefix.</b>,
        success: <b>Updated prefix.</b>,
      },
      {
        id: 'prefix-update-notification',
      },
    )
  }

  const isDifferent = guild?.prefix != watch('prefix', guild?.prefix)

  return (
    <form
      className="w-full max-w-lg space-y-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label
          htmlFor="prefix"
          className="block text-sm font-medium text-secondary-white"
        >
          Prefix:
        </label>
        <input
          key={`prefix-form-${guild?.id}`}
          type="text"
          className={`border-none bg-primary-purple-6 focus:outline-none ${
            isDifferent ? 'rounded-l-md' : 'rounded-md'
          }`}
          autoComplete="off"
          autoFocus
          placeholder={placeholder}
          defaultValue={guild?.prefix}
          {...register('prefix')}
        />

        {isDifferent && (
          <input
            type="submit"
            className="rounded-r-md bg-primary-lime-green py-2 px-3 text-black"
          />
        )}
      </div>

      <span className="text-sm text-red-500">
        {errors.prefix?.message as unknown as string}
      </span>
    </form>
  )
}